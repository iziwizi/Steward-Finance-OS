import { createClient } from "@/lib/supabase/server";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { PushSubscribeButton } from "./push-subscribe-button";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: notifications } = await supabase
    .from("in_app_notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button className="text-xs font-medium text-accent">Mark all read</button>
          </form>
        )}
      </div>

      <PushSubscribeButton />

      <div className="space-y-2">
        {(notifications ?? []).map((n) => (
          <form
            key={n.id}
            action={async () => {
              "use server";
              await markNotificationRead(n.id);
            }}
          >
            <button
              type="submit"
              className={`tap-target w-full rounded-2xl border p-4 text-left ${
                n.read_at ? "border-ink/10 bg-white" : "border-accent/30 bg-accent/5"
              }`}
            >
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-ink/60">{n.body}</p>
              <p className="mt-1 text-[11px] text-ink/40">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </button>
          </form>
        ))}
        {(notifications ?? []).length === 0 && (
          <p className="text-sm text-ink/50">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
