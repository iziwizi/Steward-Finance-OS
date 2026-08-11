import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import Link from "next/link";

export default async function MonthlyReviewPage() {
  const data = await getDashboardData("current_month");
  const overBudget = data.budgetHealth.filter((b) => b.warning);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Monthly Review</h1>
      <p className="text-sm text-ink/50">
        {data.period.start} — {data.period.end}
      </p>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <Row label="How much came in?" value={formatNaira(data.totalIncome)} />
        <Row label="How much went out?" value={formatNaira(data.totalExpenses)} />
        <Row label="Net cash flow" value={formatNaira(data.netCashFlow)} />
        <Row label="Total allocated" value={formatNaira(data.allocationSummary.totalPlanned)} />
        <Row label="Actually transferred" value={formatNaira(data.allocationSummary.totalSent)} />
        <Row label="Still pending" value={formatNaira(data.allocationSummary.totalPending)} last />
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">What went over budget?</h2>
        {overBudget.length === 0 ? (
          <p className="mt-2 text-sm text-accent">Nothing over 90% used — well kept.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {overBudget.map((b) => (
              <li key={b.bucketId} className="text-danger">
                {b.bucketName} — {b.percentUsed}% used
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Goal progress</h2>
        <div className="mt-2 space-y-1 text-sm">
          {data.goals.map((g) => (
            <div key={g.id} className="flex justify-between">
              <span>{g.name}</span>
              <span className="text-ink/60">
                {formatNaira(Number(g.current_amount))} / {formatNaira(Number(g.target_amount))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/journal"
        className="tap-target block rounded-xl bg-accent text-center font-medium text-white"
      >
        Reflect in Financial Journal →
      </Link>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between py-2 text-sm ${last ? "" : "border-b border-ink/5"}`}>
      <span className="text-ink/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
