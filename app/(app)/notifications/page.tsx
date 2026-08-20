import { Bell, CheckCheck, Shield, AlertTriangle, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";

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

  const getCategoryMeta = (type: string) => {
    switch (type) {
      case "bill_due":
      case "bill_reminder":
        return { label: "MANDATE • BILL CLEARANCE", icon: FileText, tone: "text-amber-700 bg-amber-50" };
      case "spending_spike":
      case "insight":
        return { label: "INSIGHT • SPENDING SPIKE", icon: AlertTriangle, tone: "text-rose-700 bg-rose-50" };
      case "sync":
        return { label: "SYSTEMS • DATA SYNCED", icon: RefreshCw, tone: "text-blue-700 bg-blue-50" };
      case "security":
      case "login":
        return { label: "SECURITY • NEW LOGIN", icon: Shield, tone: "text-emerald-700 bg-emerald-50" };
      default:
        return { label: "NOTIFICATION • SYSTEM UPDATE", icon: Bell, tone: "text-zinc-700 bg-zinc-100" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Notifications</h1>
        <p className="text-xs text-zinc-500">
          Stay updated with system warnings, upcoming bills, and pattern triggers.
        </p>
      </div>

      {/* Main Inbox Card matching Figma desktop-notifications-page */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm">
        {/* Inbox Bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900">Inbox</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                {unreadCount} New
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                Mark all as read
              </Button>
            </form>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-zinc-100">
          {(notifications ?? []).length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <Bell className="mx-auto h-6 w-6 text-zinc-300 mb-2" />
              You're all caught up! No new notifications in your inbox.
            </div>
          ) : (
            (notifications ?? []).map((n) => {
              const meta = getCategoryMeta(n.type || "system");
              const isUnread = !n.read_at;
              const formattedTime = new Date(n.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              });

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3.5 p-4.5 transition-colors ${
                    isUnread ? "bg-brand-50/20" : "hover:bg-zinc-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2 mt-1">
                    {isUnread ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-transparent shrink-0" />
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                      <Bell className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">{formattedTime}</span>
                    </div>

                    <p className="mt-1 text-xs font-bold text-zinc-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed">{n.body}</p>

                    {isUnread && (
                      <form
                        action={async () => {
                          "use server";
                          await markNotificationRead(n.id);
                        }}
                        className="mt-2"
                      >
                        <button
                          type="submit"
                          className="text-[10px] font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Mark as read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
