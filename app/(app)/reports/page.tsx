import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import type { PeriodPreset } from "@/lib/finance/allocation-engine";
import { PeriodSelect } from "./period-select";
import { generateInsights } from "@/lib/insights/generate";
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as PeriodPreset) || "current_month";
  const data = await getDashboardData(period);

  let insights: string[] = [];
  if (period === "current_month") {
    const previous = await getDashboardData("last_month");
    insights = generateInsights({
      currentIncome: data.totalIncome,
      previousIncome: previous.totalIncome,
      currentExpenses: data.totalExpenses,
      previousExpenses: previous.totalExpenses,
      currentPending: data.allocationSummary.totalPending,
      previousPending: previous.allocationSummary.totalPending,
      currentTithePending: data.titheSummary.totalPending,
    });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">
            Reports & Financial Analysis
          </h1>
          <p className="text-xs text-zinc-500">
            Period: {data.period.start} — {data.period.end}
          </p>
        </div>
        <PeriodSelect defaultValue={period} />
      </div>

      {/* 4 Summary Stat Cards across top */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Income</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">+{formatNaira(data.totalIncome)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Inflow during period</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold text-rose-500">-{formatNaira(data.totalExpenses)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Outflow spent</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Net Cash Flow</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              data.netCashFlow >= 0 ? "text-brand-600" : "text-rose-600"
            }`}
          >
            {data.netCashFlow >= 0 ? "+" : ""}
            {formatNaira(data.netCashFlow)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Net accumulated</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Savings Rate</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {data.totalIncome > 0
              ? `${Math.max(0, Math.round(((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100))}%`
              : "0%"}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Retained income</p>
        </div>
      </div>

      {/* Key Insights Alert */}
      {insights.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Lightbulb className="h-4 w-4 text-amber-600" /> Automated Financial Insights
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-xs text-zinc-700 leading-relaxed">
            {insights.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Planned vs Sent vs Pending Matrix */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900">Allocations Execution Status</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 p-3.5 border border-zinc-100">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Planned</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">
              {formatNaira(data.allocationSummary.totalPlanned)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50/60 p-3.5 border border-emerald-100">
            <p className="text-[11px] text-emerald-700 font-semibold uppercase">Transferred / Sent</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatNaira(data.allocationSummary.totalSent)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50/60 p-3.5 border border-amber-100">
            <p className="text-[11px] text-amber-800 font-semibold uppercase">Pending Transfers</p>
            <p className="mt-1 text-lg font-bold text-amber-800">
              {formatNaira(data.allocationSummary.totalPending)}
            </p>
          </div>
        </div>
      </div>

      {/* Bucket Performance Matrix */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900">Bucket Spend & Distribution</h2>
        <div className="space-y-3.5">
          {data.budgetHealth.map((b) => (
            <div key={b.bucketId} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-900">{b.bucketName}</span>
                <span className="text-zinc-500">
                  {formatNaira(b.spent)} / {formatNaira(b.allocated)} ({Math.round(b.percentUsed)}%)
                </span>
              </div>
              <ProgressBar
                percent={b.percentUsed}
                tone={b.warning ? "danger" : b.percentUsed >= 100 ? "income" : "brand"}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
