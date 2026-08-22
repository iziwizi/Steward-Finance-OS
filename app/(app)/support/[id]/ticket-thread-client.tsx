"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, ShieldCheck, User, Check, AlertCircle } from "lucide-react";
import { replyToSupportTicket, adminUpdateTicketStatus, type SupportTicket, type SupportMessage } from "@/lib/actions/support";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", tone: "bg-purple-50 text-purple-700 border-purple-200" },
  waiting_for_user: { label: "Awaiting Reply", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", tone: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

export function TicketThreadClient({
  ticket,
  messages = [],
  currentUser,
}: {
  ticket: SupportTicket;
  messages: SupportMessage[];
  currentUser: { id: string; isAdmin: boolean };
}) {
  const [replyText, setReplyText] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUpdatingStatus, startStatusTransition] = useTransition();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await replyToSupportTicket(ticket.id, replyText);
      if (res.success) {
        setReplyText("");
        setFeedback({ type: "success", text: "Reply dispatched." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to send reply." });
      }
    });
  };

  const handleStatusChange = (newStatus: any) => {
    startStatusTransition(async () => {
      const res = await adminUpdateTicketStatus(ticket.id, newStatus);
      if (res.success) {
        setFeedback({ type: "success", text: `Ticket status updated to ${newStatus}.` });
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  const statusInfo = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <Link
            href={currentUser.isAdmin ? "/admin/support" : "/support"}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mb-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Tickets</span>
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-zinc-900">{ticket.subject}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusInfo.tone}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Category: <strong className="text-zinc-600">{ticket.category}</strong> · Ticket #{ticket.id.slice(0, 8)}
          </p>
        </div>

        {/* Admin Status Switcher */}
        {currentUser.isAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-zinc-400">Status:</span>
            <select
              value={ticket.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Messages Thread */}
      <div className="space-y-4">
        {messages.map((m) => {
          const isAdminMsg = m.sender_role === "admin";
          const isCurrentUserSender = m.sender_id === currentUser.id;
          const dateStr = new Date(m.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 shadow-2xs space-y-2 text-xs leading-relaxed ${
                isAdminMsg
                  ? "border-purple-200/80 bg-purple-50/40"
                  : "border-zinc-200/80 bg-white"
              }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-100/80 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      isAdminMsg
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {isAdminMsg ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="font-bold text-zinc-900">
                    {isAdminMsg ? "StewardOS Support" : (m.sender_name || "Customer")}
                  </span>
                  {isCurrentUserSender && (
                    <span className="text-[10px] font-semibold text-zinc-400">(You)</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400">{dateStr}</span>
              </div>

              <p className="text-zinc-700 whitespace-pre-wrap pt-1">{m.message}</p>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      {ticket.status !== "closed" ? (
        <form onSubmit={handleSendReply} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-3">
          <label className="text-xs font-bold text-zinc-900 block">
            {currentUser.isAdmin ? "Reply to Customer" : "Reply to Support Team"}
          </label>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || !replyText.trim()}
              className="px-4 py-1.5 text-xs font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl bg-zinc-100 p-4 text-center text-xs text-zinc-500 font-medium">
          This support ticket is marked as Closed.
        </div>
      )}
    </div>
  );
}
