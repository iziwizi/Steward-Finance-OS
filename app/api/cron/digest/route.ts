import { NextResponse } from "next/server";
import { createBackgroundClient } from "@/lib/supabase/background";
import { renderDigestEmail, renderPushSummary, type DigestPayload, type DigestKind } from "@/lib/notifications/digest";
import { sendDigestEmail } from "@/lib/email/send";
import { sendPushToSubscription } from "@/lib/push/send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Single consolidated daily cron (06:00 UTC = 07:00 Africa/Lagos). Rolls
 * weekly (Sundays) and monthly (1st of month) reports into the same run
 * instead of separate cron entries — keeps this on one schedule regardless
 * of Vercel plan cron-count limits, and everything shares one idempotency
 * mechanism (notification_log, unique on user+type+period).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createBackgroundClient();
  const now = new Date();
  const today = isoDate(now);
  const isSunday = now.getUTCDay() === 0;
  const isFirstOfMonth = now.getUTCDate() === 1;

  const { data: users, error: usersError } = await supabase.rpc("list_users_for_notifications");
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const results: Record<string, unknown>[] = [];

  for (const u of users ?? []) {
    const userResult: Record<string, unknown> = { user_id: u.user_id };

    const jobs: { kind: DigestKind; periodKey: string; start: string; end: string }[] = [
      { kind: "daily_brief", periodKey: today, start: today, end: today },
    ];
    if (isSunday) {
      const weekAgo = isoDate(new Date(now.getTime() - 6 * 86400000));
      const isoWeek = `${now.getUTCFullYear()}-W${String(
        Math.ceil((now.getUTCDate() - now.getUTCDay() + 1) / 7)
      ).padStart(2, "0")}`;
      jobs.push({ kind: "weekly_report", periodKey: isoWeek, start: weekAgo, end: today });
    }
    if (isFirstOfMonth) {
      const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const prevMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
      const periodKey = `${prevMonth.getUTCFullYear()}-${String(prevMonth.getUTCMonth() + 1).padStart(2, "0")}`;
      jobs.push({
        kind: "monthly_report",
        periodKey,
        start: isoDate(prevMonth),
        end: isoDate(prevMonthEnd),
      });
    }

    for (const job of jobs) {
      const { data: claimed } = await supabase.rpc("claim_notification", {
        p_user_id: u.user_id,
        p_type: job.kind,
        p_period_key: job.periodKey,
      });
      if (!claimed) continue; // already sent — idempotency guard

      const { data: digest, error: digestError } = await supabase.rpc("compute_digest", {
        p_user_id: u.user_id,
        p_start: job.start,
        p_end: job.end,
      });
      if (digestError || !digest) {
        userResult[job.kind] = { error: digestError?.message ?? "no digest" };
        continue;
      }

      const payload = digest as DigestPayload;
      const { subject, html, text } = renderDigestEmail(job.kind, payload);
      const push = renderPushSummary(job.kind, payload);

      let emailStatus = "skipped (GMAIL_USER/GMAIL_APP_PASSWORD not configured)";
      if (u.notification_email) {
        try {
          await sendDigestEmail(u.notification_email, subject, html, text);
          emailStatus = "sent";
        } catch (e: any) {
          emailStatus = `error: ${e.message}`;
        }
      }

      await supabase.rpc("create_in_app_notification", {
        p_user_id: u.user_id,
        p_type: job.kind,
        p_title: push.title,
        p_body: push.body,
        p_link: "/dashboard",
      });

      const { data: subs } = await supabase.rpc("list_push_subscriptions", { p_user_id: u.user_id });
      let pushSent = 0;
      for (const sub of subs ?? []) {
        try {
          const result = await sendPushToSubscription(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            { ...push, link: "/dashboard" }
          );
          if (!result.expired) pushSent++;
        } catch {
          // best-effort — one bad subscription shouldn't fail the whole run
        }
      }

      userResult[job.kind] = { email: emailStatus, pushSent, inAppCreated: true };
    }

    results.push(userResult);
  }

  return NextResponse.json({ ranAt: now.toISOString(), isSunday, isFirstOfMonth, results });
}
