"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  FileSpreadsheet,
  FileText,
  Plus,
  ChevronDown,
} from "lucide-react";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { AllocationToggle } from "./allocation-toggle";
import { DeleteTransactionButton } from "./delete-button";
import { MobilePageHeader } from "@/components/mobile-page-header";

export interface TransactionRow {
  id: string;
  type: "income" | "expense";
  date: string;
  formattedDate: string;
  description: string;
  category: string;
  categoryId?: string;
  account: string;
  accountId?: string;
  status: "Cleared" | "Pending";
  amount: number;
  allocations: any[];
  deleteAction: () => Promise<any>;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function TransactionsView({
  rows,
  buckets,
  accounts,
}: {
  rows: TransactionRow[];
  buckets: any[];
  accounts: any[];
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear + 1; y >= currentYear - 4; y--) {
      list.push(String(y));
    }
    return list;
  }, [currentYear]);

  const [tab, setTab] = useState<"all" | "income" | "expenses">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Date Filter State
  const [dateFilterMode, setDateFilterMode] = useState<"preset" | "month_year" | "custom">("preset");
  const [datePreset, setDatePreset] = useState<"all" | "this_month" | "last_month" | "this_year">("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedTxIds, setExpandedTxIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTxIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRows = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);
    const thisYearStr = String(now.getFullYear());

    return rows.filter((r) => {
      // Type Filter
      if (tab === "income" && r.type !== "income") return false;
      if (tab === "expenses" && r.type !== "expense") return false;

      // Category Filter
      if (selectedCategory !== "all") {
        if (r.type === "income" && selectedCategory !== "Income") return false;
        if (r.type === "expense" && r.categoryId !== selectedCategory && r.category !== selectedCategory) {
          return false;
        }
      }

      // Account Filter
      if (selectedAccount !== "all" && r.accountId !== selectedAccount && r.account !== selectedAccount) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== "all" && r.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      // Date Filtering Logic
      if (dateFilterMode === "preset") {
        if (datePreset === "this_month" && !r.date.startsWith(thisMonth)) return false;
        if (datePreset === "last_month" && !r.date.startsWith(lastMonth)) return false;
        if (datePreset === "this_year" && !r.date.startsWith(thisYearStr)) return false;
      } else if (dateFilterMode === "month_year") {
        if (selectedYear !== "all") {
          if (selectedMonth !== "all") {
            const ym = `${selectedYear}-${selectedMonth}`;
            if (!r.date.startsWith(ym)) return false;
          } else {
            if (!r.date.startsWith(selectedYear)) return false;
          }
        } else if (selectedMonth !== "all") {
          const m = r.date.slice(5, 7);
          if (m !== selectedMonth) return false;
        }
      } else if (dateFilterMode === "custom") {
        if (customFrom && r.date < customFrom) return false;
        if (customTo && r.date > customTo) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchCat = r.category.toLowerCase().includes(q);
        const matchAcc = r.account.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchAcc) return false;
      }

      return true;
    });
  }, [
    rows,
    tab,
    selectedCategory,
    selectedAccount,
    selectedStatus,
    dateFilterMode,
    datePreset,
    selectedMonth,
    selectedYear,
    customFrom,
    customTo,
    searchQuery,
  ]);

  // Group by date for Mobile View
  const mobileGroups = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    const groups: { label: string; items: TransactionRow[] }[] = [];
    const map = new Map<string, TransactionRow[]>();

    filteredRows.forEach((r) => {
      const list = map.get(r.date) || [];
      list.push(r);
      map.set(r.date, list);
    });

    map.forEach((items, dateStr) => {
      let label = new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (dateStr === todayStr) label = "TODAY";
      else if (dateStr === yesterdayStr) label = "YESTERDAY";

      groups.push({ label: label.toUpperCase(), items });
    });

    return groups;
  }, [filteredRows]);

  const hasActiveFilters =
    tab !== "all" ||
    selectedCategory !== "all" ||
    selectedAccount !== "all" ||
    selectedStatus !== "all" ||
    dateFilterMode !== "preset" ||
    datePreset !== "all" ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setTab("all");
    setSelectedCategory("all");
    setSelectedAccount("all");
    setSelectedStatus("all");
    setDateFilterMode("preset");
    setDatePreset("all");
    setSelectedMonth("all");
    setSelectedYear(String(currentYear));
    setCustomFrom("");
    setCustomTo("");
    setSearchQuery("");
  };

  const exportUrl = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (tab !== "all") params.set("tab", tab);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedAccount !== "all") params.set("account", selectedAccount);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    if (dateFilterMode === "custom") {
      if (customFrom) params.set("from", customFrom);
      if (customTo) params.set("to", customTo);
    } else if (dateFilterMode === "month_year" && selectedYear !== "all") {
      if (selectedMonth !== "all") {
        params.set("from", `${selectedYear}-${selectedMonth}-01`);
        const endDay = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
        params.set("to", `${selectedYear}-${selectedMonth}-${endDay}`);
      }
    }

    return `/api/export?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Transactions" fallbackHref="/dashboard" />

      {/* Top Header & Action Row */}
      <div className="hidden md:flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Transactions</h1>
          <p className="text-xs text-zinc-500">
            Keep track of all your income, expenses, and envelope allocations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/add"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            New Transaction
          </Link>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-fast">
                <a
                  href={exportUrl("csv")}
                  onClick={() => setShowExportMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  Export as CSV
                </a>
                <a
                  href={exportUrl("excel")}
                  onClick={() => setShowExportMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  Export Excel (.xlsx)
                </a>
                <a
                  href={exportUrl("pdf")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowExportMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                  Print / Save PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs: All / Income / Expenses */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            {(["all", "income", "expenses"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  tab === t
                    ? "bg-white text-brand-600 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {t === "all" ? "All Transactions" : t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ledger..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-1.5 pl-8 pr-7 text-xs text-zinc-800 focus:border-brand-500 focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs border-t border-zinc-100">
          <div className="flex items-center gap-1 text-zinc-400">
            <Filter className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Filters:</span>
          </div>

          {/* Date Mode Selector */}
          <select
            value={dateFilterMode}
            onChange={(e) => setDateFilterMode(e.target.value as any)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="preset">Date: Quick Presets</option>
            <option value="month_year">Date: Select Month & Year</option>
            <option value="custom">Date: Custom Date Range</option>
          </select>

          {/* 1. Quick Presets Mode */}
          {dateFilterMode === "preset" && (
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year ({currentYear})</option>
            </select>
          )}

          {/* 2. Month & Year Mode */}
          {dateFilterMode === "month_year" && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="all">All Months</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="all">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Custom Date Range Mode */}
          {dateFilterMode === "custom" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="From"
                className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              />
              <span className="text-zinc-400">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                placeholder="To"
                className="rounded-lg border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
              />
            </div>
          )}

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">Category: All</option>
            {buckets.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">Account: All</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              Reset
            </button>
          )}

          <span className="ml-auto text-[11px] font-medium text-zinc-400">
            {filteredRows.length} {filteredRows.length === 1 ? "record" : "records"}
          </span>
        </div>
      </div>

      {/* DESKTOP VIEW: Clean Table Layout */}
      <div className="hidden md:block rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-zinc-400">
                    No transactions matching your selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((tx) => {
                  const totalAllocated = tx.allocations.reduce(
                    (s: number, a: any) => s + Number(a.planned_amount || 0),
                    0
                  );
                  const isExpanded = !!expandedTxIds[tx.id];

                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-zinc-50/70 align-top">
                      <td className="py-3.5 px-4 font-medium text-zinc-500 whitespace-nowrap">
                        {tx.formattedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="block font-bold text-zinc-900 text-xs">{tx.description}</span>
                          <span className="block text-[11px] font-normal text-zinc-400">
                            {tx.category} · {tx.account}
                          </span>

                          {tx.allocations.length > 0 && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleExpand(tx.id)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-all"
                              >
                                <span>{tx.allocations.length} allocations</span>
                                <span className="text-zinc-400">·</span>
                                <span>{formatNaira(totalAllocated)}</span>
                                <ChevronDown
                                  className={`h-3 w-3 text-zinc-400 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="mt-2 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-fast max-w-md">
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200/60 pb-1.5">
                                    <span>Envelope Breakdown</span>
                                    <span>Status</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {tx.allocations.map((a: any) => (
                                      <div
                                        key={a.id}
                                        className="flex items-center justify-between text-[11px]"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-zinc-700">
                                            {a.budget_buckets?.name}:
                                          </span>
                                          <span className="font-semibold text-zinc-900">
                                            {formatNaira(Number(a.planned_amount))}
                                          </span>
                                        </div>
                                        <AllocationToggle id={a.id} status={a.status} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">{tx.account}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            tx.status === "Cleared" ? "text-zinc-700" : "text-amber-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              tx.status === "Cleared" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {tx.status}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          tx.type === "income" ? "text-emerald-600" : "text-zinc-900"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatNaira(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <DeleteTransactionButton onDelete={tx.deleteAction} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW: Grouped Card/List Pattern matching Figma Mobile */}
      <div className="md:hidden space-y-4">
        {filteredRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-400">
            No transactions found for the selected filters.
          </div>
        ) : (
          mobileGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
              <div className="rounded-xl border border-zinc-200/80 bg-white divide-y divide-zinc-100 shadow-xs overflow-hidden">
                {group.items.map((tx) => {
                  const isExpanded = !!expandedTxIds[tx.id];
                  const totalAllocated = tx.allocations.reduce(
                    (s: number, a: any) => s + Number(a.planned_amount || 0),
                    0
                  );

                  return (
                    <div key={tx.id} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              tx.type === "income"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {tx.type === "income" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-zinc-900">{tx.description}</p>
                            <p className="truncate text-[10px] text-zinc-400">
                              {tx.category} · {tx.account}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <p
                            className={`text-xs font-bold ${
                              tx.type === "income" ? "text-emerald-600" : "text-zinc-900"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "-"}
                            {formatNaira(tx.amount)}
                          </p>
                          <span className="text-[9px] font-medium text-zinc-400">{tx.status}</span>
                        </div>
                      </div>

                      {tx.allocations && tx.allocations.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => toggleExpand(tx.id)}
                            className="flex items-center justify-between w-full text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 py-0.5"
                          >
                            <span>
                              {tx.allocations.length} Allocations ({formatNaira(totalAllocated)})
                            </span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 rounded-lg bg-zinc-50 p-2.5 space-y-2 animate-in fade-in duration-fast">
                              {tx.allocations.map((a: any) => (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between text-[10px]"
                                >
                                  <span className="font-medium text-zinc-700">
                                    {a.budget_buckets?.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-900">
                                      {formatNaira(Number(a.planned_amount))}
                                    </span>
                                    <AllocationToggle id={a.id} status={a.status} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
