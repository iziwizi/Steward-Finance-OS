import Link from "next/link";
import { Zap, Calendar, ArrowUpRight, ArrowDownLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function MonthlyReviewPage() {
  const data = await getDashboardData("current_month");

  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-monthly-review-page */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">{monthName} Review</h1>
          <p className="text-xs text-zinc-500">
            Your automated monthly summary, cash flow metrics, and budget health.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50"
        >
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          Previous Months
        </Link>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-monthly-review-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 3 Metric Summary Cards (7/12 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Card 1: Income Summary */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Income Summary</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Stable
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              +{formatNaira(data.totalIncome)}
            </p>
            <p className="text-xs text-zinc-500">
              Matched your projected income for this month across all active bank accounts.
            </p>
          </div>

          {/* Card 2: Expense Summary */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Expense Summary</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                -4.2% vs Last Month
              </span>
            </div>
            <p className="text-3xl font-extrabold text-rose-500">
              -{formatNaira(data.totalExpenses)}
            </p>
            <p className="text-xs text-zinc-500">
              You spent less in Food & Utilities. Major recurring transactions are cleared.
            </p>
          </div>

          {/* Card 3: Net Cash Flow */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Net Cash Flow</span>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
                Positive Reserve
              </span>
            </div>
            <p className="text-3xl font-extrabold text-brand-600">
              {data.netCashFlow >= 0 ? "+" : ""}
              {formatNaira(data.netCashFlow)}
            </p>
            <p className="text-xs text-zinc-500">
              Your surplus was successfully funneled to goals and active investment pools.
            </p>
          </div>
        </div>

        {/* Right Column: Allocation Health, Goals, Obligations (5/12 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Allocation Health Card */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Allocation Health
              </h2>
              <span className="text-xs font-bold text-brand-600">
                {data.budgetHealth.filter((b) => !b.warning).length} of {data.budgetHealth.length} On Track
              </span>
            </div>

            <div className="space-y-3">
              {data.budgetHealth.slice(0, 3).map((b) => (
                <div key={b.bucketId} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-900">{b.bucketName}</span>
                    <span className="text-zinc-500 font-semibold">
                      {formatNaira(b.spent)} / {formatNaira(b.allocated)}
                    </span>
                  </div>
                  <ProgressBar
                    percent={b.percentUsed}
                    tone={b.warning ? "danger" : "brand"}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Goals Milestones Card */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Goals Milestones
              </h2>
              <Link href="/goals" className="text-xs font-bold text-brand-600">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {data.goals.slice(0, 2).map((g) => {
                const { progressPercent } = calculateGoalProgress(
                  Number(g.target_amount),
                  Number(g.current_amount)
                );
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-900">{g.name}</span>
                      <span className="font-bold text-brand-600">{progressPercent}%</span>
                    </div>
                    <ProgressBar percent={progressPercent} tone="brand" className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Obligations Card */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Upcoming Obligations
              </h2>
              <Link href="/bills" className="text-xs font-bold text-brand-600">
                Manage
              </Link>
            </div>

            <div className="divide-y divide-zinc-100">
              {data.bills.slice(0, 2).map((b) => (
                <div key={b.id} className="flex justify-between items-center py-2 text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900">{b.name}</p>
                    <p className="text-[10px] text-zinc-400">Due day {b.due_day}</p>
                  </div>
                  <span className="font-bold text-zinc-900">{formatNaira(Number(b.amount))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Insight Banner */}
      <div className="flex items-center gap-3.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-4 shadow-xs">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <Zap className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium text-brand-950 leading-relaxed">
          Steward Insight: Excellent job this month! You maintained high financial discipline and your savings rate is healthy. Your Kingdom giving and allocations are on schedule. Keep it up!
        </p>
      </div>
    </div>
  );
}
