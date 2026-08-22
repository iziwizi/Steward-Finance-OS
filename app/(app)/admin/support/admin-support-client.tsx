"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, MessageSquare, ShieldCheck, ArrowLeft } from "lucide-react";
import { type SupportTicket } from "@/lib/actions/support";

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", tone: "bg-purple-50 text-purple-700 border-purple-200" },
  waiting_for_user: { label: "Awaiting Reply", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", tone: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

export function AdminSupportClient({ tickets = [] }: { tickets: SupportTicket[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    const subjectMatch = t.subject.toLowerCase().includes(term);
    const catMatch = t.category.toLowerCase().includes(term);
    const emailMatch = (t.user_email || "").toLowerCase().includes(term);
    const idMatch = t.id.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesStatus && (subjectMatch || catMatch || emailMatch || idMatch);
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by subject, user email, or ID..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Statuses ({tickets.length})</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_for_user">Waiting for User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
                    No support tickets match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                  const dateStr = new Date(t.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{t.subject}</p>
                          <p className="text-[10px] font-mono text-zinc-400">#{t.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-700">
                        {t.user_email || "User"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusInfo.tone}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/support/${t.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100"
                        >
                          <span>Open</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
