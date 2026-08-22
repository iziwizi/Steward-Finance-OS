"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href={currentUser.isAdmin ? "/admin/support" : "/support"}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Tickets</span>
            </Link>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900">{ticket.subject}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusInfo.tone}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1 flex-wrap">
              <span>Category: <strong className="text-zinc-700 font-semibold">{ticket.category}</strong></span>
              <span>•</span>
              <span>Ticket ID: <strong className="text-zinc-700 font-semibold">#{ticket.id.slice(0, 8)}</strong></span>
              {currentUser.isAdmin && ticket.user_email && (
                <>
                  <span>•</span>
                  <span>Customer: <strong className="text-purple-700 font-semibold">{ticket.user_name || ticket.user_email}</strong> ({ticket.user_email})</span>
                </>
              )}
            </div>
          </div>

          {/* Admin Status Switcher */}
          {currentUser.isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status:</span>
              <select
                value={ticket.status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-800 focus:border-brand-500 focus:outline-none shadow-2xs"
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
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold animate-in fade-in duration-fast ${
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

      {/* Unified Conversation Thread Container */}
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-6 shadow-2xs flex flex-col space-y-4 min-h-[360px]">
        <div className="text-center py-1 border-b border-zinc-200/60 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Conversation Thread · {messages.length} {messages.length === 1 ? "Message" : "Messages"}
          </span>
        </div>

        {/* Chat Bubbles */}
        <div className="space-y-4 flex-1">
          {messages.map((m) => {
            const isAdminMsg = m.sender_role === "admin";
            const isMe = m.sender_id === currentUser.id;
            const dateStr = new Date(m.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });

            // Chat bubble alignment & styling
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Sender Identity Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                  {isAdminMsg ? (
                    <div className="flex items-center gap-1 font-bold text-purple-700">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white">
                        <ShieldCheck className="h-2.5 w-2.5" />
                      </div>
                      <span>StewardOS Support</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-bold text-zinc-700">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
                        <User className="h-2.5 w-2.5" />
                      </div>
                      <span>{isMe ? "You" : (m.sender_name || "Customer")}</span>
                    </div>
                  )}
                  <span className="text-zinc-400 text-[10px]">· {dateStr}</span>
                </div>

                {/* Bubble Body */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed break-words shadow-2xs ${
                    isMe
                      ? "bg-brand-600 text-white rounded-tr-xs"
                      : isAdminMsg
                      ? "bg-purple-50/90 border border-purple-200/80 text-zinc-900 rounded-tl-xs"
                      : "bg-white border border-zinc-200/80 text-zinc-900 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input Form */}
        {ticket.status !== "closed" ? (
          <form onSubmit={handleSendReply} className="pt-3 border-t border-zinc-200/60 space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-2xs focus-within:border-brand-500 transition-colors">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                {currentUser.isAdmin ? "Reply to Customer" : "Reply to Support Team"}
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  currentUser.isAdmin
                    ? "Type your response to the customer..."
                    : "Type your reply to the support team..."
                }
                className="w-full resize-none border-0 bg-transparent p-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
              />
              <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                <span className="text-[10px] text-zinc-400">
                  Press Send Reply to update conversation
                </span>
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
            </div>
          </form>
        ) : (
          <div className="rounded-xl bg-zinc-200/60 p-3 text-center text-xs text-zinc-500 font-semibold border border-zinc-200">
            This support ticket is marked as Closed.
          </div>
        )}
      </div>
    </div>
  );
}
