"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  CheckCheck,
  Shield,
  AlertTriangle,
  RefreshCw,
  FileText,
  CheckCircle2,
  X,
  ChevronLeft,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  type: string | null;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  link?: string | null;
}

export function NotificationsView({
  notifications = [],
}: {
  notifications: NotificationItem[];
}) {
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getCategoryMeta = (type: string) => {
    switch (type) {
      case "bill_due":
      case "bill_reminder":
        return { label: "MANDATE • BILL CLEARANCE", icon: FileText, tone: "text-amber-700 bg-amber-50" };
      case "spending_spike":
      case "insight":
        return { label: "INSIGHT • SPENDING SPIKE", icon: AlertTriangle, tone: "text-rose-700 bg-rose-50" };
      case "daily_brief":
      case "weekly_report":
      case "monthly_report":
        return { label: "STEWARDOS • DAILY BRIEF", icon: Bell, tone: "text-brand-700 bg-brand-50" };
      case "sync":
        return { label: "SYSTEMS • DATA SYNCED", icon: RefreshCw, tone: "text-blue-700 bg-blue-50" };
      case "security":
      case "login":
        return { label: "SECURITY • NEW LOGIN", icon: Shield, tone: "text-emerald-700 bg-emerald-50" };
      default:
        return { label: "NOTIFICATION • SYSTEM UPDATE", icon: Bell, tone: "text-zinc-700 bg-zinc-100" };
    }
  };

  const handleOpenNotification = (n: NotificationItem) => {
    setSelectedNotification(n);
    if (!n.read_at) {
      startTransition(async () => {
        await markNotificationRead(n.id);
      });
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Notifications" fallbackHref="/dashboard" />

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Notifications</h1>
        <p className="text-xs text-zinc-500">
          Stay updated with system briefs, upcoming obligations, and pattern triggers.
        </p>
      </div>

      {/* Main Inbox Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        {/* Inbox Header Bar */}
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
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={handleMarkAllRead}
              className="px-3 py-1 text-xs"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-zinc-100">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              <Bell className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
              <p className="font-semibold text-zinc-700 text-sm">You&apos;re all caught up!</p>
              <p className="mt-1">No notifications currently in your inbox.</p>
            </div>
          ) : (
            notifications.map((n) => {
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
                  onClick={() => handleOpenNotification(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenNotification(n);
                    }
                  }}
                  className={`flex items-start gap-3.5 p-4 cursor-pointer transition-all hover:bg-zinc-50 active:bg-zinc-100 ${
                    isUnread ? "bg-brand-50/25" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mt-1 shrink-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isUnread ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-transparent"
                      }`}
                    />
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

                    <p className="mt-1 text-xs font-bold text-zinc-900 break-words">{n.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-600 leading-relaxed break-words line-clamp-2">
                      {n.body}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-brand-600 hover:text-brand-700">
                        Click to view full message →
                      </span>
                      {isUnread && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          ● Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full-Screen / Modal Detail View for Clicked Notification */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-fast max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="space-y-1">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    getCategoryMeta(selectedNotification.type || "system").tone
                  }`}
                >
                  {getCategoryMeta(selectedNotification.type || "system").label}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {new Date(selectedNotification.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 break-words leading-snug">
                {selectedNotification.title}
              </h2>
            </div>

            {/* Full Body Content */}
            <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100">
              <p className="text-xs text-zinc-700 leading-relaxed break-words whitespace-pre-wrap">
                {selectedNotification.body}
              </p>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Marked as Read</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedNotification.link && (
                  <Link
                    href={selectedNotification.link}
                    onClick={() => setSelectedNotification(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-600 transition-all"
                  >
                    <span>View Activity</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
