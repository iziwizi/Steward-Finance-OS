"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Calendar, X, ChevronLeft, Filter } from "lucide-react";
import { type SupportTicket } from "@/lib/actions/support";

const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", tone: "bg-purple-50 text-purple-700 border-purple-200" },
  waiting_for_user: { label: "Awaiting Reply", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", tone: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

const PAGE_SIZE = 10;

export function AdminSupportClient({ tickets = [] }: { tickets: SupportTicket[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Combined Search + Status + Date Range Filter
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Status Filter
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      if (!matchesStatus) return false;

      // 2. Search Term Filter
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const subjectMatch = t.subject.toLowerCase().includes(term);
        const catMatch = t.category.toLowerCase().includes(term);
        const emailMatch = (t.user_email || "").toLowerCase().includes(term);
        const nameMatch = (t.user_name || "").toLowerCase().includes(term);
        const idMatch = t.id.toLowerCase().includes(term);
        if (!subjectMatch && !catMatch && !emailMatch && !nameMatch && !idMatch) {
          return false;
        }
      }

      // 3. Date Range Filter
      if (fromDate) {
        const ticketDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (ticketDate < fromDate) return false;
      }
      if (toDate) {
        const ticketDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (ticketDate > toDate) return false;
      }

      return true;
    });
  }, [tickets, searchTerm, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIdx = (page - 1) * PAGE_SIZE;
  const paginatedTickets = filteredTickets.slice(startIdx, startIdx + PAGE_SIZE);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== "all" || fromDate || toDate);

  return (
    <div className="space-y-4">
      {/* Search, Filter & Date Range Bar */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by subject, customer email, name, or ticket ID..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 focus:border-brand-500 focus:outline-none"
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

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Date Range:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-[11px] font-bold text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 font-medium">
            Showing <strong className="text-zinc-700 font-bold">{filteredTickets.length}</strong> matching of{" "}
            <strong>{tickets.length}</strong> total
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                    No support tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => {
                  const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                  const dateStr = new Date(t.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-zinc-900 truncate">{t.subject}</p>
                          <p className="text-[10px] font-mono text-zinc-400">#{t.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-700">
                        <p className="font-bold text-zinc-900">{t.user_name || "Customer"}</p>
                        <p className="text-[11px] text-zinc-400">{t.user_email || "No email"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusInfo.tone}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/support/${t.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          <span>Open Ticket</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/60 px-4 py-3 text-xs">
            <p className="text-[11px] text-zinc-500 font-medium">
              Page <span className="font-bold text-zinc-800">{page}</span> of{" "}
              <span className="font-bold text-zinc-800">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const isEllipsis = prevP && p - prevP > 1;

                    return (
                      <div key={p} className="flex items-center gap-1">
                        {isEllipsis && <span className="px-1 text-zinc-400">…</span>}
                        {p === page ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-xs">
                            {p}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            {p}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
