"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendPushToSubscription } from "@/lib/push/send";

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("in_app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("in_app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function sendTestPushNotification() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  if (!subs || subs.length === 0) {
    return { success: false, error: "No active push subscriptions registered for this device." };
  }

  const payload = {
    title: "StewardOS Test",
    body: "Push notifications are working correctly.",
    link: "/dashboard",
  };

  let sentCount = 0;
  for (const s of subs) {
    try {
      const res = await sendPushToSubscription(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
        payload
      );
      if (res.expired) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      } else {
        sentCount++;
      }
    } catch (err: any) {
      console.error("Test push send error:", err);
      return { success: false, error: err.message || "Failed to dispatch push notification." };
    }
  }

  // Also record in-app notification so user can see it in inbox
  await supabase.from("in_app_notifications").insert({
    user_id: user.id,
    type: "system",
    title: "StewardOS Test Notification",
    body: "Push notifications are working correctly on your active device.",
    link: "/dashboard",
  });

  revalidatePath("/notifications");
  return { success: true, count: sentCount };
}
