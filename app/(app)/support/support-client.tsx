"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, HelpCircle, ChevronRight, X } from "lucide-react";
import { createSupportTicket, type SupportTicket } from "@/lib/actions/support";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "General Support",
  "Bug Report",
  "Feature Request",
  "Account Issue",
  "Payment/Finance",
  "Other",
];

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", tone: "bg-purple-50 text-purple-700 border-purple-200" },
  waiting_for_user: { label: "Awaiting Reply", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", tone: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

export function SupportClient({ initialTickets = [] }: { initialTickets: SupportTicket[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createSupportTicket(formData);
      if (res.success) {
        setFeedback({ type: "success", text: "Your support ticket has been submitted. Our team will review it shortly." });
        setIsModalOpen(false);
        form.reset();
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to submit ticket." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with New Ticket Action */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Help & Customer Support</h2>
          <p className="text-xs text-zinc-400">
            Submit questions, feature suggestions, or issue reports to the StewardOS team.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="px-3.5 py-1.5 text-xs font-semibold"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Ticket
        </Button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-3">
        {initialTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400 space-y-3">
            <HelpCircle className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="font-bold text-sm text-zinc-800">No support tickets yet</p>
            <p className="max-w-sm mx-auto text-zinc-500">
              Need help or have a question? Create a ticket and our support team will assist you.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="px-4 py-2 text-xs"
              >
                + Create Support Ticket
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
            {initialTickets.map((t) => {
              const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
              const dateStr = new Date(t.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Link
                  key={t.id}
                  href={`/support/${t.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors block text-xs"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 truncate">{t.subject}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusInfo.tone}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-medium text-zinc-600">{t.category}</span>
                      <span>·</span>
                      <span>Created on {dateStr}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0 ml-3" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Create Support Ticket</h3>
                <p className="text-xs text-zinc-400">Our engineering and support team will respond promptly.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Question about envelope allocation rules..."
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="General Support"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Message Details
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Please describe your issue or suggestion in detail..."
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 px-3.5 py-1.5 font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" disabled={isPending} className="px-4 py-1.5 font-bold">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
