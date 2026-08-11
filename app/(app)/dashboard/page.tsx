import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { logOut } from "@/lib/actions/auth";
import { markCelebrationSeen } from "@/lib/actions/celebrations";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData("current_month");

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink/50">Current Month</p>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <form action={logOut}>
          <button className="text-sm text-ink/40 underline">Log out</button>
        </form>
      </header>

      {data.latestCelebration && (
        <form
          action={async () => {
            "use server";
            await markCelebrationSeen(data.latestCelebration!.id);
          }}
        >
          <button
            type="submit"
            className="tap-target flex w-full items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-left"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-medium text-ink">{data.latestCelebration.title}</p>
              <p className="text-sm text-ink/60">{data.latestCelebration.message}</p>
            </div>
            <span className="text-xs text-ink/40">Dismiss</span>
          </button>
        </form>
      )}

      {/* The single most important number: what can I actually spend right now */}
      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <p className="text-xs text-ink/50">Available to spend</p>
        <p className="mt-1 text-3xl font-semibold text-accent">
          {formatNaira(data.availableCash)}
        </p>
        {data.allocationSummary.totalPending > 0 && (
          <p className="mt-1 text-xs text-ink/50">
            {formatNaira(data.allocationSummary.totalPending)} still committed to pending
            allocations — not counted as available
          </p>
        )}
      </section>

      {/* Where is my money */}
      <section className="grid grid-cols-2 gap-3">
        <Card label="Income" value={formatNaira(data.totalIncome)} tone="accent" />
        <Card label="Expenses" value={formatNaira(data.totalExpenses)} tone="danger" />
        <Card label="Net Cash Flow" value={formatNaira(data.netCashFlow)} tone="ink" wide />
      </section>

      {/* Planned vs sent vs pending — the core new feature */}
      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Allocations</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold">{formatNaira(data.allocationSummary.totalPlanned)}</p>
            <p className="text-xs text-ink/50">Planned</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-accent">
              {formatNaira(data.allocationSummary.totalSent)}
            </p>
            <p className="text-xs text-ink/50">Sent</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gold">
              {formatNaira(data.allocationSummary.totalPending)}
            </p>
            <p className="text-xs text-ink/50">Pending</p>
          </div>
        </div>
        {data.pendingAllocations.length > 0 && (
          <Link
            href="/transactions?filter=pending"
            className="mt-3 block rounded-xl bg-gold/10 px-3 py-2 text-sm font-medium text-gold"
          >
            {data.pendingAllocations.length} allocation(s) still pending — review →
          </Link>
        )}
      </section>

      {/* Tithe — first class */}
      <section className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <h2 className="text-sm font-semibold text-ink/70">Tithe</h2>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold">
            {formatNaira(data.titheSummary.totalPlanned)}
          </span>
          <span
            className={
              data.titheSummary.totalPending > 0
                ? "text-sm font-medium text-gold"
                : "text-sm font-medium text-accent"
            }
          >
            {data.titheSummary.totalPending > 0
              ? `${formatNaira(data.titheSummary.totalPending)} pending`
              : "Fully sent"}
          </span>
        </div>
      </section>

      {/* Budget health per bucket */}
      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Buckets</h2>
        <div className="mt-3 space-y-3">
          {data.budgetHealth.map((b) => (
            <div key={b.bucketId}>
              <div className="flex justify-between text-sm">
                <span>{b.bucketName}</span>
                <span className="text-ink/60">
                  {formatNaira(b.spent)} / {formatNaira(b.allocated)}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-ink/10">
                <div
                  className={`h-2 rounded-full ${b.warning ? "bg-danger" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Goals */}
      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink/70">Goals</h2>
          <Link href="/goals" className="text-xs font-medium text-accent">
            See all
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {data.goals.slice(0, 3).map((g) => {
            const { progressPercent } = calculateGoalProgress(
              Number(g.target_amount),
              Number(g.current_amount)
            );
            return (
              <div key={g.id}>
                <div className="flex justify-between text-sm">
                  <span>{g.name}</span>
                  <span className="text-ink/60">{progressPercent}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-ink/10">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  tone,
  wide,
}: {
  label: string;
  value: string;
  tone: "accent" | "danger" | "ink";
  wide?: boolean;
}) {
  const toneClass =
    tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-4 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs text-ink/50">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
