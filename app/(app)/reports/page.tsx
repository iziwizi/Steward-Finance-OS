import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import type { PeriodPreset } from "@/lib/finance/allocation-engine";
import { PeriodSelect } from "./period-select";
import { generateInsights } from "@/lib/insights/generate";
import { Lightbulb } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
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
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Analytics</p>
        <h1 className="text-display-md text-zinc-900">Reports</h1>
      </div>

      <PeriodSelect defaultValue={period} />

      <p className="text-xs text-zinc-400">
        Period: {data.period.start} — {data.period.end}
      </p>

      {insights.length > 0 && (
        <section className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
            <Lightbulb className="h-4 w-4 text-amber-600" /> Key Insights
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-xs text-zinc-600 leading-relaxed">
            {insights.map((i, idx) => (
              <li key={idx}>• {i}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Income" value={formatNaira(data.totalIncome)} tone="income" />
        <StatCard label="Expenses" value={formatNaira(data.totalExpenses)} tone="expense" />
        <StatCard
          label="Net Cash Flow"
          value={formatNaira(data.netCashFlow)}
          className="col-span-2"
        />
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Planned vs Sent vs Pending</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-financial-caption font-bold text-zinc-900">
              {formatNaira(data.allocationSummary.totalPlanned)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Planned</p>
          </div>
          <div>
            <p className="text-financial-caption font-bold text-emerald-600">
              {formatNaira(data.allocationSummary.totalSent)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Sent</p>
          </div>
          <div>
            <p className="text-financial-caption font-bold text-amber-600">
              {formatNaira(data.allocationSummary.totalPending)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Pending</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Tithe & Giving Status</h2>
        <p className="mt-2 text-financial-md font-bold text-zinc-900">
          {formatNaira(data.titheSummary.totalSent)} <span className="text-xs font-normal text-zinc-500">sent of {formatNaira(data.titheSummary.totalPlanned)}</span>
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Bucket Performance</h2>
        <div className="mt-4 space-y-3.5">
          {data.budgetHealth.map((b) => (
            <div key={b.bucketId}>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-900">{b.bucketName}</span>
                <span className={b.warning ? "text-rose-600 font-bold" : "text-zinc-500"}>
                  {formatNaira(b.spent)} / {formatNaira(b.allocated)} ({b.percentUsed}%)
                </span>
              </div>
              <ProgressBar
                percent={b.percentUsed}
                tone={b.warning ? "danger" : "brand"}
                className="mt-1.5 h-2"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
