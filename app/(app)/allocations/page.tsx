import Link from "next/link";
import { Sliders, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { TargetPercentEditor } from "@/components/target-percent-editor";

export default async function AllocationsPage() {
  const data = await getDashboardData("current_month");

  const totalPlanned = data.allocationSummary.totalPlanned;
  const totalSent = data.allocationSummary.totalSent;
  const totalPending = data.allocationSummary.totalPending;
  const availableToAllocate = Math.max(0, data.totalIncome - totalPlanned);

  const percentAllocated =
    data.totalIncome > 0 ? Math.round((totalSent / data.totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-allocations-center */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Allocation Center</h1>
          <p className="text-xs text-zinc-500">
            Manage your envelope distribution rules and track funding health.
          </p>
        </div>
        <Link
          href="/settings?tab=allocations"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <Sliders className="h-3.5 w-3.5" />
          Adjust Rules
        </Link>
      </div>

      {/* 4 Top Metric Cards matching Figma desktop-allocations-center */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Income (Dark Teal) */}
        <div className="flex flex-col justify-between rounded-xl bg-brand-500 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
              Monthly Income
            </span>
            <span className="rounded-full bg-brand-400/40 px-2 py-0.5 text-[10px] font-bold text-white">
              Base
            </span>
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
          <h2 className="text-sm font-bold text-zinc-900">Allocation Buckets</h2>
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
                <th className="py-3 px-4 text-right">Planned</th>
                <th className="py-3 px-4 text-right">Sent Amount</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4">Funding Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.budgetHealth.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
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
    </div>
  );
}
