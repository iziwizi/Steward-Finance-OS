import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { logOut } from "@/lib/actions/auth";
import { markCelebrationSeen } from "@/lib/actions/celebrations";
import {
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  ArrowLeftRight,
  Calendar,
  ChevronRight,
  Zap,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const data = await getDashboardData("current_month");

  const recentTx = [
    ...data.recentIncome.map((i) => ({
      id: `inc-${i.id}`,
      title: i.source || "Income",
      category: "Income",
      amount: Number(i.amount),
      date: i.txn_date,
      isIncome: true,
    })),
    ...data.recentExpenses.map((e) => ({
      id: `exp-${e.id}`,
      title: e.vendor || e.reason || "Expense",
      category: (e.budget_buckets as { name?: string } | null)?.name || "Expense",
      amount: Number(e.amount),
      date: e.txn_date,
      isIncome: false,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
      {/* Header */}
      <header className="flex items-center justify-between lg:col-span-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Current Month</p>
          <h1 className="text-display-md text-zinc-900">Dashboard</h1>
        </div>
        <form action={logOut}>
          <button className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors">
            Log out
          </button>
        </form>
      </header>

      {/* Celebration Banner */}
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
            className="tap-target flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left transition-transform active:scale-[0.99] animate-fade-in-up"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-zinc-900">{data.latestCelebration.title}</p>
              <p className="text-sm text-zinc-600">{data.latestCelebration.message}</p>
            </div>
            <span className="text-xs font-medium text-amber-700">Dismiss</span>
          </button>
        </form>
      )}

      {/* Main Column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Figma Hero Spend Card */}
        <section className="rounded-2xl bg-brand-500 p-6 text-white shadow-sm transition-all">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
            Available to Spend
          </p>
          <p className="mt-1 text-financial-hero font-extrabold tracking-tight text-white">
            {formatNaira(data.availableCash)}
          </p>
          {data.allocationSummary.totalPending > 0 && (
            <p className="mt-1 text-xs text-brand-100/90">
              {formatNaira(data.allocationSummary.totalPending)} committed to pending allocations
            </p>
          )}

          <div className="my-4 border-t border-brand-400/40" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-brand-100">Income</p>
              <p className="mt-0.5 text-financial-md font-bold text-emerald-300">
                +{formatNaira(data.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-brand-100">Expenses</p>
              <p className="mt-0.5 text-financial-md font-bold text-white">
                -{formatNaira(data.totalExpenses)}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="grid grid-cols-4 gap-2 text-center">
          <Link
            href="/income/new"
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-800">Income</span>
          </Link>

          <Link
            href="/expenses/new"
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-800">Expense</span>
          </Link>

          <Link
            href="/transactions?filter=pending"
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <PieChart className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-800">Allocate</span>
          </Link>

          <Link
            href="/transactions"
            className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
              <ArrowLeftRight className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-800">Transfer</span>
          </Link>
        </section>

        {/* Allocation Health Card */}
        <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Allocation Health</h2>
            <Link href="/settings" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
              Manage
            </Link>
          </div>
          <div className="mt-4 space-y-3.5">
            {data.budgetHealth.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">No active budget buckets configured.</p>
            ) : (
              data.budgetHealth.map((b) => (
                <div key={b.bucketId}>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-900">{b.bucketName}</span>
                    <span className="text-zinc-500">
                      {formatNaira(b.spent)} / {formatNaira(b.allocated)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={b.percentUsed}
                    tone={b.warning ? "danger" : b.percentUsed >= 100 ? "income" : "brand"}
                    className="mt-1.5 h-2"
                  />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Transactions Card */}
        <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Recent Transactions</h2>
            <Link href="/transactions" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
              View All
            </Link>
          </div>
          <div className="mt-3 divide-y divide-zinc-100">
            {recentTx.length === 0 ? (
              <p className="py-4 text-center text-xs text-zinc-400">No transactions recorded yet this month.</p>
            ) : (
              recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        tx.isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {tx.isIncome ? (
                        <ArrowDownLeft className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{tx.title}</p>
                      <p className="text-xs text-zinc-400">{tx.category}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.isIncome ? "text-emerald-600" : "text-zinc-900"
                    }`}
                  >
                    {tx.isIncome ? "+" : "-"}
                    {formatNaira(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Side Column (Desktop & Secondary info) */}
      <div className="space-y-6 lg:col-span-1">
        {/* Tithe & Kingdom Giving Card */}
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Tithe & Giving</h2>
            {data.titheSummary.totalPending > 0 ? (
              <Badge tone="warning">Pending</Badge>
            ) : (
              <Badge tone="success">Accounted</Badge>
            )}
          </div>
          <p className="mt-2 text-financial-md font-bold text-zinc-900">
            {formatNaira(data.titheSummary.totalPlanned)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {data.titheSummary.totalPending > 0
              ? `${formatNaira(data.titheSummary.totalPending)} remaining to be sent`
              : "Your giving allocations are completely fulfilled."}
          </p>
        </section>

        {/* Active Goals Card */}
        <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Active Goals</h2>
            <Link href="/goals" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
              See all
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {data.goals.length === 0 ? (
              <p className="py-2 text-xs text-zinc-400">No active financial goals set up.</p>
            ) : (
              data.goals.slice(0, 3).map((g) => {
                const { progressPercent } = calculateGoalProgress(
                  Number(g.target_amount),
                  Number(g.current_amount)
                );
                return (
                  <div key={g.id} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-900">{g.name}</span>
                      <span className="text-brand-600">{progressPercent}%</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatNaira(Number(g.current_amount))} of {formatNaira(Number(g.target_amount))}
                    </p>
                    <ProgressBar percent={progressPercent} tone="brand" className="mt-2 h-1.5" />
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Upcoming Bills Card */}
        <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Upcoming Bills</h2>
            <Link href="/bills" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
              See all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-zinc-100">
            {data.bills.length === 0 ? (
              <p className="py-2 text-xs text-zinc-400">No upcoming recurring bills.</p>
            ) : (
              data.bills.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                      <Calendar className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">{b.name}</p>
                      <p className="text-[11px] text-zinc-400">Due day {b.due_day}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-900">
                    {formatNaira(Number(b.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Insight / Motivation Card */}
        <section className="flex items-center gap-3 rounded-xl border border-brand-200/60 bg-brand-50/50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium text-brand-900">
            Stay consistent with your weekly allocations to reach your savings targets faster.
          </p>
        </section>
      </div>
    </div>
  );
}
