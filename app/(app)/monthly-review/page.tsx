import Link from "next/link";
import { Zap, Calendar, ArrowUpRight, ArrowDownLeft, CheckCircle2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MonthDatePicker } from "@/components/month-date-picker";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { StewardInsightBanner } from "@/components/steward-insight-banner";

export default async function MonthlyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = params.month || defaultMonth;

  const [yearStr, monthNumStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10) || now.getFullYear();
  const monthIndex = (parseInt(monthNumStr, 10) || now.getMonth() + 1) - 1;

  const start = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const end = new Date(year, monthIndex + 1, 0).toISOString().slice(0, 10);

  const prevMonthDate = new Date(year, monthIndex - 1, 1);
  const nextMonthDate = new Date(year, monthIndex + 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const monthDisplayName = new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const data = await getDashboardData("custom", { start, end });

  const hasData = data.totalIncome > 0 || data.totalExpenses > 0;

  const exportUrl = (format: string) => `/api/export?format=${format}&from=${start}&to=${end}`;

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader
        title="Monthly Review"
        fallbackHref="/dashboard"
        action={
          hasData ? (
            <a
              href={exportUrl("csv")}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50"
            >
              <Download className="h-3 w-3 text-zinc-500" />
              <span>Export</span>
            </a>
          ) : undefined
        }
      />

      {/* Header with Month Navigation Controls and Export */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">{monthDisplayName} Review</h1>
          <p className="text-xs text-zinc-500">
            Automated monthly financial review, cash flow health, and envelope disbursement summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Switcher Controls */}
          <MonthDatePicker
            currentMonth={selectedMonth}
            baseUrl="/monthly-review"
            prevMonthKey={prevMonthKey}
            nextMonthKey={nextMonthKey}
          />

          {hasData && (
            <div className="hidden sm:flex items-center gap-1.5">
              <a
                href={exportUrl("csv")}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-zinc-400" />
                <span>Export CSV</span>
              </a>
              <a
                href={exportUrl("excel")}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-all"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Excel</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400">
          <Calendar className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
          <p className="font-semibold text-zinc-700 text-sm">No financial records found for {monthDisplayName}</p>
          <p className="mt-1">Record transactions or switch to another month to inspect the automated review.</p>
          <div className="mt-4">
            <Link
              href="/add"
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
            >
              + Record Transaction
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Main 2-Column Grid matching Figma desktop-monthly-review-page */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: 3 Metric Summary Cards (7/12 cols) */}
            <div className="space-y-4 lg:col-span-7">
              {/* Card 1: Income Summary */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">Income Summary</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Received
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-emerald-600">
                  +{formatNaira(data.totalIncome)}
                </p>
                <p className="text-xs text-zinc-500">
                  Total deposits and payouts recorded in {monthDisplayName}.
                </p>
              </div>

              {/* Card 2: Expense Summary */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">Expense Summary</span>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                    Outflows
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-rose-500">
                  -{formatNaira(data.totalExpenses)}
                </p>
                <p className="text-xs text-zinc-500">
                  Total expenditures and envelope disbursements recorded.
                </p>
              </div>

              {/* Card 3: Net Cash Flow */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">Net Cash Flow</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      data.netCashFlow >= 0
                        ? "bg-brand-50 text-brand-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {data.netCashFlow >= 0 ? "Positive Reserve" : "Deficit Warning"}
                  </span>
                </div>
                <p
                  className={`text-3xl font-extrabold ${
                    data.netCashFlow >= 0 ? "text-brand-600" : "text-rose-600"
                  }`}
                >
                  {data.netCashFlow >= 0 ? "+" : ""}
                  {formatNaira(data.netCashFlow)}
                </p>
                <p className="text-xs text-zinc-500">
                  {data.netCashFlow >= 0
                    ? "Net surplus available for allocation envelopes and goal funding."
                    : "Outflows exceeded total income for this monthly cycle."}
                </p>
              </div>
            </div>

            {/* Right Column: Allocation Health, Goals, Obligations (5/12 cols) */}
            <div className="space-y-4 lg:col-span-5">
              {/* Allocation Health Card (All Envelopes dynamically rendered) */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Allocation Health
                  </h2>
                  <span className="text-xs font-bold text-brand-600">
                    {data.budgetHealth.filter((b) => !b.warning).length} of {data.budgetHealth.length} On Track
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {data.budgetHealth.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-2">No active budget envelopes configured.</p>
                  ) : (
                    data.budgetHealth.map((b) => (
                      <div key={b.bucketId} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-zinc-900 font-semibold">{b.bucketName}</span>
                          <span className="text-zinc-500 font-semibold">
                            <span className="font-bold text-zinc-900">{formatNaira(b.sentAmount)}</span>
                            <span className="text-zinc-400"> / {formatNaira(b.allocated)}</span>
                          </span>
                        </div>
                        <ProgressBar
                          percent={b.fundingProgress}
                          tone={b.fundingProgress >= 100 ? "income" : "brand"}
                          className="h-1.5"
                        />
                      </div>
                    ))
                  )}
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
                  {data.goals.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-2">No active financial goals recorded.</p>
                  ) : (
                    data.goals.slice(0, 3).map((g) => {
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
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Dynamic Insight Banner */}
          <StewardInsightBanner
            insight={{
              title: data.netCashFlow >= 0 ? `Net Surplus Achieved in ${monthDisplayName}` : `Deficit Margin in ${monthDisplayName}`,
              desc: data.netCashFlow >= 0
                ? `You achieved a positive net reserve of ${formatNaira(data.netCashFlow)} in ${monthDisplayName}. Keep allocating surpluses to emergency vaults and productive investment pools.`
                : `Total disbursements exceeded received income by ${formatNaira(Math.abs(data.netCashFlow))}. Take time to review discretionary expenses and adjust envelope percentages in Settings.`,
              tag: data.netCashFlow >= 0 ? "+ Positive Margin" : "Review Required",
            }}
          />
        </>
      )}
    </div>
  );
}
