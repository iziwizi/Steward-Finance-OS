import { Bell, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { PushSubscribeButton } from "./push-subscribe-button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: notifications } = await supabase
    .from("in_app_notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Activity</p>
          <h1 className="text-display-md text-zinc-900">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button className="tap-target inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </form>
        )}
      </div>

      <PushSubscribeButton />

      <div className="space-y-2.5">
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
              className={`tap-target w-full rounded-xl border p-4 text-left shadow-sm transition-all active:scale-[0.99] ${
                n.read_at
                  ? "border-zinc-200/80 bg-white"
                  : "border-brand-300 bg-brand-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-zinc-900">{n.title}</p>
                {!n.read_at && (
                  <span className="flex h-2 w-2 shrink-0 rounded-full bg-brand-500 mt-1.5" />
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{n.body}</p>
              <p className="mt-2 text-[11px] font-medium text-zinc-400">
                {new Date(n.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </button>
          </form>
        ))}
        {(notifications ?? []).length === 0 && (
          <EmptyState
            icon={Bell}
            title="All caught up"
            description="You don't have any notifications at the moment."
          />
        )}
      </div>
    </div>
  );
}
