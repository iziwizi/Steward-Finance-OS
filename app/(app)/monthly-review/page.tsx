import Link from "next/link";
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

export default async function MonthlyReviewPage() {
  const data = await getDashboardData("current_month");

  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">{monthName} Review</h1>
          <p className="text-xs text-zinc-500">
            Your automated monthly summary, cash flow metrics, and budget discipline report.
          </p>
        </div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Write Journal Reflection
        </Link>
      </div>

      {/* 3 Top Summary Metrics Cards matching Figma desktop-monthly-review-page */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Income Summary
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            +{formatNaira(data.totalIncome)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total received across accounts</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Expense Summary
          </p>
          <p className="mt-2 text-2xl font-extrabold text-rose-500">
            -{formatNaira(data.totalExpenses)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total spent on living & obligations</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Net Cash Flow
          </p>
          <p
            className={`mt-2 text-2xl font-extrabold ${
              data.netCashFlow >= 0 ? "text-brand-600" : "text-rose-600"
            }`}
          >
            {data.netCashFlow >= 0 ? "+" : ""}
            {formatNaira(data.netCashFlow)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {data.netCashFlow >= 0 ? "Surplus capital saved" : "Operating deficit"}
          </p>
        </div>
      </div>

      {/* Allocation Performance Table */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-900">Allocation Performance</h2>
          <span className="text-xs font-semibold text-zinc-400">
            {data.budgetHealth.length} Buckets
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {data.budgetHealth.map((b) => (
            <div key={b.bucketId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-900">{b.bucketName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px]">
                    {formatNaira(b.spent)} of {formatNaira(b.allocated)}
                  </span>
                  <Badge tone={b.warning ? "danger" : b.percentUsed >= 100 ? "success" : "neutral"}>
                    {Math.round(b.percentUsed)}%
                  </Badge>
                </div>
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

      {/* Bottom Summary Insight Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-200/80 bg-brand-50/70 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium text-brand-950">
          Monthly review finalized. Take 2 minutes to record your reflection and gratitude prayer in the Financial Journal.
        </p>
      </div>
    </div>
  );
}
