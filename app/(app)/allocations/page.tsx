import Link from "next/link";
import { Sliders, Plus, CheckCircle2, Clock, AlertCircle, ArrowDownLeft, Sparkles, Check, ChevronLeft, ChevronRight, Landmark, Info } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { TargetPercentEditor } from "@/components/target-percent-editor";
import { BucketPurposeEditor } from "@/components/bucket-purpose-editor";
import { AllocationToggle } from "@/app/(app)/transactions/allocation-toggle";
import { AllocationDateFilter } from "@/components/allocation-date-filter";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 5;

export default async function AllocationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ income_id?: string; date?: string; filter?: string; page?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const targetIncomeId = params?.income_id;
  const filterDateParam = params?.date;
  const filterType = params?.filter;
  const currentPage = Math.max(1, parseInt(params?.page || "1", 10) || 1);

  let activeDateFilter: string | undefined = filterDateParam;
  if (!activeDateFilter && filterType === "today") {
    activeDateFilter = new Date().toISOString().slice(0, 10);
  } else if (!activeDateFilter && filterType === "yesterday") {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    activeDateFilter = y.toISOString().slice(0, 10);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch accounts to resolve destination accounts
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("id, name, institution")
    .eq("user_id", user?.id);

  const accountMap = new Map<string, { name: string; institution: string | null }>();
  (accountsData ?? []).forEach((acc) => {
    accountMap.set(acc.id, { name: acc.name, institution: acc.institution });
  });

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let incomeQuery = supabase
    .from("income_transactions")
    .select(
      "id, txn_date, source, amount, description, allocations(id, bucket_id, planned_amount, status, sent_at, budget_buckets(id, name, purpose, default_account_id))",
      { count: "exact" }
    )
    .eq("user_id", user?.id)
    .order("txn_date", { ascending: false });

  if (activeDateFilter) {
    incomeQuery = incomeQuery.eq("txn_date", activeDateFilter);
  }

  incomeQuery = incomeQuery.range(from, to);

  const [data, { data: incomeWithAllocations, count: totalIncomeCount }] = await Promise.all([
    getDashboardData("current_month"),
    incomeQuery,
  ]);

  const totalCount = totalIncomeCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const totalPlanned = data.allocationSummary.totalPlanned;
  const totalSent = data.allocationSummary.totalSent;
  const totalPending = data.allocationSummary.totalPending;
  const availableToAllocate = Math.max(0, data.totalIncome - totalPlanned);

  const percentAllocated =
    data.totalIncome > 0 ? Math.round((totalSent / data.totalIncome) * 100) : 0;

  // Build pagination query helper
  const getPaginationUrl = (page: number) => {
    const p = new URLSearchParams();
    if (filterType) p.set("filter", filterType);
    if (filterDateParam) p.set("date", filterDateParam);
    if (page > 1) p.set("page", String(page));
    const str = p.toString();
    return `/allocations${str ? `?${str}` : ""}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      {/* App-like Mobile Back Header */}
      <MobilePageHeader
        title="Allocation Center"
        fallbackHref="/dashboard"
        action={
          <Link
            href="/settings?tab=allocations"
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition-all"
          >
            <Sliders className="h-3 w-3" />
            <span>Adjust Rules</span>
          </Link>
        }
      />

      {/* Header matching Figma desktop-allocations-center */}
      <div className="hidden md:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Allocation Center</h1>
          <p className="text-xs text-zinc-500">
            Manage your envelope distribution rules, verify income obligations, and mark transfers sent.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/settings?tab=allocations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50"
          >
            <Sliders className="h-3.5 w-3.5" />
            Adjust Rules
          </Link>
          <Link
            href="/income/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Record Income
          </Link>
        </div>
      </div>

      {/* 4 Top Metric Cards matching Figma desktop-allocations-center */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Income (Dark Teal) */}
        <div className="flex flex-col justify-between rounded-xl bg-brand-500 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
              Monthly Income
            </span>
            <Link
              href="/income/new"
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-brand-700 shadow-xs hover:bg-brand-50 active:scale-95 transition-all"
            >
              <Plus className="h-3 w-3 text-brand-700" />
              <span>Add Income</span>
            </Link>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              {formatNaira(data.totalIncome)}
            </p>
            <p className="mt-1 text-[11px] text-brand-100/80">Received this calendar month</p>
          </div>
        </div>

        {/* Card 2: Allocated So Far */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Allocated So Far
            </span>
            <span className="text-[11px] font-bold text-brand-600">{percentAllocated}%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-zinc-900 lg:text-3xl">
              {formatNaira(totalSent)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">Transferred into designated vaults</p>
          </div>
        </div>

        {/* Card 3: Pending Disbursement */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Pending Disbursement
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              Active
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-amber-700 lg:text-3xl">
              {formatNaira(totalPending)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">Awaiting transfer clearance</p>
          </div>
        </div>

        {/* Card 4: Available to Allocate */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Available to Allocate
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Ready
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-emerald-600 lg:text-3xl">
              {formatNaira(availableToAllocate)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">Uncommitted surplus income</p>
          </div>
        </div>
      </div>

      {/* Main Allocation Buckets Table matching Figma desktop-allocations-center */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Allocation Buckets Summary</h2>
            <p className="text-[11px] text-zinc-400">Monthly aggregate distribution progress across your active rules</p>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {data.budgetHealth.length} Active Buckets
          </span>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Bucket Name</th>
                <th className="py-3 px-4">Target %</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4 text-right">Planned</th>
                <th className="py-3 px-4 text-right">Sent Amount</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4">Funding Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.budgetHealth.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-400">
                    No active allocation buckets found. Configure your rules in Settings.
                  </td>
                </tr>
              ) : (
                data.budgetHealth.map((b) => {
                  const targetPlanned = b.allocated;
                  const sent = b.sentAmount;
                  const remaining = b.remainingAmount;
                  const isComplete = sent >= targetPlanned && targetPlanned > 0;
                  const progress = b.fundingProgress;

                  return (
                    <tr key={b.bucketId} className="transition-colors hover:bg-zinc-50/70">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">{b.bucketName}</td>
                      <td className="py-3.5 px-4 font-medium text-zinc-500">
                        <TargetPercentEditor
                          bucketId={b.bucketId}
                          bucketName={b.bucketName}
                          initialPercent={b.targetPercent ?? 0}
                        />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-500">
                        <BucketPurposeEditor
                          bucketId={b.bucketId}
                          bucketName={b.bucketName}
                          initialPurpose={b.purpose}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-zinc-700">
                        {formatNaira(targetPlanned)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-brand-600">
                        {formatNaira(sent)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-zinc-500">
                        {remaining > 0 ? formatNaira(remaining) : "₦0.00"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <ProgressBar
                              percent={progress}
                              tone={isComplete ? "income" : "brand"}
                              className="h-2"
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              isComplete ? "text-emerald-700" : "text-zinc-500"
                            }`}
                          >
                            {isComplete ? "Complete" : `${progress}%`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Income Allocations & Obligations Section */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-2.5 border-b border-zinc-100 pb-3.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Recent Income Allocation Obligations</h2>
              <p className="text-[11px] text-zinc-500">
                Review and mark individual allocation transfers as <strong>Sent</strong> when physical funds are moved into destination accounts.
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0"
            >
              View Full Ledger →
            </Link>
          </div>

          {/* Date Filter Toolbar */}
          <AllocationDateFilter
            currentDate={filterDateParam}
            currentFilter={filterType}
          />
        </div>

        {(!incomeWithAllocations || incomeWithAllocations.length === 0) ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            {activeDateFilter
              ? `No income allocation records found for ${new Date(activeDateFilter + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}.`
              : "No income transactions recorded yet. Record income to generate automatic allocation obligations."}
          </div>
        ) : (
          <div className="space-y-4">
            {incomeWithAllocations.map((inc: any) => {
              const allocationsList = (inc.allocations ?? []).map((a: any) => {
                const bucketObj = a.budget_buckets;
                const defaultAccId = bucketObj?.default_account_id;
                const accInfo = defaultAccId ? accountMap.get(defaultAccId) : null;
                const destinationLabel = accInfo
                  ? `${accInfo.name}${accInfo.institution ? ` (${accInfo.institution})` : ""}`
                  : "Destination not configured";

                return {
                  id: a.id,
                  bucketName: bucketObj?.name ?? "General",
                  purpose: bucketObj?.purpose || null,
                  destination: destinationLabel,
                  hasDestination: Boolean(accInfo),
                  plannedAmount: Number(a.planned_amount),
                  status: a.status as "pending" | "sent",
                };
              });

              const totalPlannedForInc = allocationsList.reduce((s: number, a: any) => s + a.plannedAmount, 0);
              const totalSentForInc = allocationsList
                .filter((a: any) => a.status === "sent")
                .reduce((s: number, a: any) => s + a.plannedAmount, 0);
              const isFullySettled = allocationsList.length > 0 && totalSentForInc >= totalPlannedForInc;
              const isTargetHighlight = targetIncomeId === inc.id;

              return (
                <div
                  key={inc.id}
                  id={`income-${inc.id}`}
                  className={`rounded-xl border p-4 transition-all ${
                    isTargetHighlight
                      ? "border-brand-500 bg-brand-50/30 ring-2 ring-brand-200"
                      : "border-zinc-200/80 bg-zinc-50/40"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                        <ArrowDownLeft className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-zinc-900">{inc.source || inc.description || "Income Deposit"}</p>
                          <span className="text-[11px] font-bold text-emerald-600">
                            +{formatNaira(Number(inc.amount))}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(inc.txn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                          {inc.description && ` · ${inc.description}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isFullySettled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isFullySettled ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {isFullySettled ? "Settled" : "Pending Action"}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {formatNaira(totalSentForInc)} / {formatNaira(totalPlannedForInc)} Sent
                      </span>
                    </div>
                  </div>

                  {/* Envelope Breakdown Rows with Destination Account & Purpose */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {allocationsList.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex flex-col justify-between rounded-lg border border-zinc-200/70 bg-white p-3 text-xs shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-zinc-900 text-xs truncate">{a.bucketName}</p>
                            <p className="text-[11px] font-extrabold text-brand-600 mt-0.5">
                              {formatNaira(a.plannedAmount)}
                            </p>
                          </div>
                          <AllocationToggle id={a.id} status={a.status} />
                        </div>

                        {/* Destination Account & Purpose Info */}
                        <div className="border-t border-zinc-100 pt-2 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Landmark className="h-3 w-3 text-zinc-400 shrink-0" />
                            <span className={`truncate ${a.hasDestination ? "font-semibold text-zinc-700" : "text-zinc-400 italic"}`}>
                              {a.destination}
                            </span>
                          </div>

                          {a.purpose && (
                            <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                              &ldquo;{a.purpose}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs">
            <span className="text-zinc-500">
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total record{totalCount === 1 ? "" : "s"})
            </span>

            <div className="flex items-center gap-1.5">
              {currentPage > 1 ? (
                <Link
                  href={getPaginationUrl(currentPage - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 font-semibold text-zinc-300 cursor-not-allowed">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </span>
              )}

              {currentPage < totalPages ? (
                <Link
                  href={getPaginationUrl(currentPage + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 font-semibold text-zinc-300 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
