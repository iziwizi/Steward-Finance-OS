import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import type { PeriodPreset } from "@/lib/finance/allocation-engine";
import { PeriodSelect } from "./period-select";
import { generateInsights } from "@/lib/insights/generate";
import { Lightbulb } from "lucide-react";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <PeriodSelect defaultValue={period} />

      <p className="text-xs text-ink/50">
        {data.period.start} — {data.period.end}
      </p>

      {insights.length > 0 && (
        <section className="rounded-2xl border border-ink/10 bg-white p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink/70">
            <Lightbulb className="h-4 w-4 text-gold" /> Insights
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
            {insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard label="Income" value={formatNaira(data.totalIncome)} />
        <SummaryCard label="Expenses" value={formatNaira(data.totalExpenses)} />
        <SummaryCard label="Net Cash Flow" value={formatNaira(data.netCashFlow)} wide />
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Planned vs Sent vs Pending</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-semibold">{formatNaira(data.allocationSummary.totalPlanned)}</p>
            <p className="text-xs text-ink/50">Planned</p>
          </div>
          <div>
            <p className="font-semibold text-accent">
              {formatNaira(data.allocationSummary.totalSent)}
            </p>
            <p className="text-xs text-ink/50">Sent</p>
          </div>
          <div>
            <p className="font-semibold text-gold">
              {formatNaira(data.allocationSummary.totalPending)}
            </p>
            <p className="text-xs text-ink/50">Pending</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <h2 className="text-sm font-semibold text-ink/70">Tithe Status</h2>
        <p className="mt-1 text-lg font-semibold">
          {formatNaira(data.titheSummary.totalSent)} sent of{" "}
          {formatNaira(data.titheSummary.totalPlanned)}
        </p>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Bucket Performance</h2>
        <div className="mt-3 space-y-2">
          {data.budgetHealth.map((b) => (
            <div key={b.bucketId} className="flex justify-between text-sm">
              <span>{b.bucketName}</span>
              <span className={b.warning ? "text-danger" : "text-ink/60"}>
                {formatNaira(b.spent)} / {formatNaira(b.allocated)} ({b.percentUsed}%)
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-4 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
