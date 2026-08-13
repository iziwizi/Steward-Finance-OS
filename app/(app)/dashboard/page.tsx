import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { logOut } from "@/lib/actions/auth";
import { markCelebrationSeen } from "@/lib/actions/celebrations";
import { Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const data = await getDashboardData("current_month");

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
      <header className="flex items-start justify-between lg:col-span-3">
        <div>
          <p className="text-sm text-zinc-500">Current Month</p>
          <h1 className="text-display-md text-zinc-900">Dashboard</h1>
        </div>
        <form action={logOut}>
          <button className="text-sm text-zinc-400 underline">Log out</button>
        </form>
      </header>

      {data.latestCelebration && (
        <form
          action={async () => {
            "use server";
            await markCelebrationSeen(data.latestCelebration!.id);
          }}
          className="lg:col-span-3"
        >
          <button
            type="submit"
            className="tap-target flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left animate-fade-in-up"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-zinc-900">{data.latestCelebration.title}</p>
              <p className="text-sm text-zinc-600">{data.latestCelebration.message}</p>
            </div>
            <span className="text-xs text-zinc-400">Dismiss</span>
          </button>
        </form>
      )}

      {/* Main column: the numbers that change day to day */}
      <div className="space-y-6 lg:col-span-2">
        {/* The single most important number: what can I actually spend right now */}
        <section className="rounded-lg border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs text-zinc-500">Available to spend</p>
          <p className="mt-1 text-financial-hero text-brand-500">
            {formatNaira(data.availableCash)}
          </p>
          {data.allocationSummary.totalPending > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              {formatNaira(data.allocationSummary.totalPending)} still committed to pending
              allocations — not counted as available
            </p>
          )}
        </section>

        {/* Where is my money */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard label="Income" value={formatNaira(data.totalIncome)} tone="income" />
          <StatCard label="Expenses" value={formatNaira(data.totalExpenses)} tone="expense" />
          <StatCard
            label="Net Cash Flow"
            value={formatNaira(data.netCashFlow)}
            className="col-span-2"
          />
        </section>

        {/* Planned vs sent vs pending — the core new feature */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-700">Allocations</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-financial-caption text-zinc-900">
                {formatNaira(data.allocationSummary.totalPlanned)}
              </p>
              <p className="text-xs text-zinc-500">Planned</p>
            </div>
            <div>
              <p className="text-financial-caption text-income">
                {formatNaira(data.allocationSummary.totalSent)}
              </p>
              <p className="text-xs text-zinc-500">Sent</p>
            </div>
            <div>
              <p className="text-financial-caption text-amber-600">
                {formatNaira(data.allocationSummary.totalPending)}
              </p>
              <p className="text-xs text-zinc-500">Pending</p>
            </div>
          </div>
          {data.pendingAllocations.length > 0 && (
            <Link
              href="/transactions?filter=pending"
              className="mt-3 block rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
            >
              {data.pendingAllocations.length} allocation(s) still pending — review →
            </Link>
          )}
        </section>
      </div>

      {/* Side column: things you check, not things that change hourly */}
      <div className="space-y-6 lg:col-span-1">
        {/* Tithe — first class */}
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-zinc-700">Tithe</h2>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-financial-md text-zinc-900">
              {formatNaira(data.titheSummary.totalPlanned)}
            </span>
            {data.titheSummary.totalPending > 0 ? (
              <Badge tone="warning">{formatNaira(data.titheSummary.totalPending)} pending</Badge>
            ) : (
              <Badge tone="success">Fully sent</Badge>
            )}
          </div>
        </section>

        {/* Budget health per bucket */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-700">Buckets</h2>
          <div className="mt-3 space-y-3">
            {data.budgetHealth.map((b) => (
              <div key={b.bucketId}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-900">{b.bucketName}</span>
                  <span className="text-zinc-500">
                    {formatNaira(b.spent)} / {formatNaira(b.allocated)}
                  </span>
                </div>
                <ProgressBar percent={b.percentUsed} tone={b.warning ? "danger" : "brand"} className="mt-1.5" />
              </div>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700">Goals</h2>
            <Link href="/goals" className="text-xs font-medium text-brand-500">
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
                    <span className="text-zinc-900">{g.name}</span>
                    <span className="text-zinc-500">{progressPercent}%</span>
                  </div>
                  <ProgressBar percent={progressPercent} className="mt-1.5" />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
