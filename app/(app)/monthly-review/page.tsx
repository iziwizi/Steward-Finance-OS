import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MonthlyReviewPage() {
  const data = await getDashboardData("current_month");
  const overBudget = data.budgetHealth.filter((b) => b.warning);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Summary</p>
        <h1 className="text-display-md text-zinc-900">Monthly Review</h1>
        <p className="text-xs text-zinc-400 mt-1">
          {data.period.start} — {data.period.end}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm divide-y divide-zinc-100">
        <Row label="How much came in?" value={formatNaira(data.totalIncome)} isIncome />
        <Row label="How much went out?" value={formatNaira(data.totalExpenses)} isExpense />
        <Row label="Net cash flow" value={formatNaira(data.netCashFlow)} isBold />
        <Row label="Total planned allocations" value={formatNaira(data.allocationSummary.totalPlanned)} />
        <Row label="Actually transferred / sent" value={formatNaira(data.allocationSummary.totalSent)} isIncome />
        <Row label="Still pending allocations" value={formatNaira(data.allocationSummary.totalPending)} isWarning />
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Budget Health</h2>
        {overBudget.length === 0 ? (
          <p className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60">
            ✓ Excellent discipline! No budget buckets are currently exceeding 90% utilization.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs">
            {overBudget.map((b) => (
              <li key={b.bucketId} className="flex justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-700 font-medium">
                <span>{b.bucketName}</span>
                <span className="font-bold">{b.percentUsed}% used</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Goal Progress</h2>
        <div className="mt-3 space-y-2.5">
          {data.goals.length === 0 ? (
            <p className="text-xs text-zinc-400 py-2">No goals tracked this month.</p>
          ) : (
            data.goals.map((g) => (
              <div key={g.id} className="flex justify-between text-xs py-1">
                <span className="font-semibold text-zinc-900">{g.name}</span>
                <span className="text-zinc-500 font-medium">
                  {formatNaira(Number(g.current_amount))} / {formatNaira(Number(g.target_amount))}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <Link
        href="/journal"
        className="tap-target block w-full rounded-lg bg-brand-500 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.99]"
      >
        Reflect in Financial Journal →
      </Link>
    </div>
  );
}

function Row({
  label,
  value,
  isIncome,
  isExpense,
  isWarning,
  isBold,
}: {
  label: string;
  value: string;
  isIncome?: boolean;
  isExpense?: boolean;
  isWarning?: boolean;
  isBold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 text-xs">
      <span className="text-zinc-600">{label}</span>
      <span
        className={`font-bold ${
          isIncome
            ? "text-emerald-600"
            : isExpense
            ? "text-zinc-900"
            : isWarning
            ? "text-amber-600"
            : isBold
            ? "text-brand-600 text-sm font-extrabold"
            : "text-zinc-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
