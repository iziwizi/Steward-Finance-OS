import { NextResponse } from "next/server";
import { createBackgroundClient } from "@/lib/supabase/background";
import { sendPushToSubscription } from "@/lib/push/send";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

/**
 * Periodic "Have you logged?" reminder cron.
 * Fires every 3 hours during Lagos active daytime: 08:00, 11:00, 14:00, 17:00, 20:00 Lagos (WAT / UTC+1)
 * = 07:00, 10:00, 13:00, 16:00, 19:00 UTC
 * Vercel schedule: "0 7,10,13,16,19 * * *"
 *
 * Channel: In-App Notification + Push Notification (strictly NO EMAIL).
 *
 * Suppression & Safety:
 * 1. Checks if user recorded any income or expense transactions in the last 6 hours -> Suppressed.
 * 2. Checks if a reminder was already created in the last 2.5 hours -> Deduped.
 * 3. Does not send overnight.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized. Please provide valid Bearer CRON_SECRET." },
      { status: 401 }
    );
  }

  const supabase = createBackgroundClient();
  const now = new Date();
  const nowIso = now.toISOString();

  // 6 hours ago threshold for recent transaction activity
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  // 2.5 hours ago threshold for dedup
  const dedupWindow = new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString();

  // Fetch all users with completed onboarding
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, timezone")
    .not("onboarding_completed_at", "is", null);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const results: Record<string, unknown>[] = [];

  const REMINDER_MESSAGES = [
    {
      title: "Quick Steward check",
      body: "Have you logged your income and expenses today? Take a moment to stay on top of your money.",
    },
    {
      title: "StewardOS reminder",
      body: "Don't forget to record recent financial transactions you've made today. Keep your allocations accurate.",
    },
    {
      title: "Financial check-in",
      body: "Have you recorded any purchases or earnings today? A quick 30-second log keeps your peace of mind intact.",
    },
  ];

  // Rotate reminder variation based on current hour
  const msgIndex = Math.floor(now.getUTCHours() / 3) % REMINDER_MESSAGES.length;
  const reminderContent = REMINDER_MESSAGES[msgIndex];

  for (const user of users ?? []) {
    const userResult: Record<string, unknown> = { user_id: user.id };

    try {
      // 1. Dedup check: check if a reminder was already issued in the dedup window
      const { data: recentReminders } = await supabase
        .from("in_app_notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "reminder")
        .gte("created_at", dedupWindow)
        .limit(1);

      if (recentReminders && recentReminders.length > 0) {
        userResult.status = "skipped: recent reminder sent";
        results.push(userResult);
        continue;
      }

      // 2. Suppression check: check if user has logged any income or expense in the last 6 hours
      const [{ data: recentIncome }, { data: recentExpense }] = await Promise.all([
        supabase
          .from("income_transactions")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", sixHoursAgo)
          .limit(1),
        supabase
          .from("expense_transactions")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", sixHoursAgo)
          .limit(1),
      ]);

      const hasRecentActivity =
        (recentIncome && recentIncome.length > 0) ||
        (recentExpense && recentExpense.length > 0);

      if (hasRecentActivity) {
        userResult.status = "suppressed: recent transaction activity found";
        results.push(userResult);
        continue;
      }

      // 3. Create in-app notification
      await supabase.from("in_app_notifications").insert({
        user_id: user.id,
        type: "reminder",
        title: reminderContent.title,
        body: reminderContent.body,
        link: "/dashboard",
      });

      // 4. Send device push notification (strictly no email)
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key")
        .eq("user_id", user.id);

      let pushSent = 0;
      for (const sub of subs ?? []) {
        try {
          const res = await sendPushToSubscription(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            { title: reminderContent.title, body: reminderContent.body, link: "/dashboard" }
          );
          if (res.expired) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          } else {
            pushSent++;
          }
        } catch {
          // best-effort push delivery
        }
      }

      userResult.status = "dispatched";
      userResult.pushSent = pushSent;
      userResult.inAppCreated = true;
    } catch (err: any) {
      userResult.status = "error";
      userResult.error = err.message;
    }

    results.push(userResult);
  }

  const dispatchedCount = results.filter((r) => r.status === "dispatched").length;

  return NextResponse.json({
    ranAt: nowIso,
    dispatchedCount,
    totalUsersChecked: users?.length ?? 0,
    results,
  });
}
