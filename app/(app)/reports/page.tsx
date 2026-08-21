import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MonthDatePicker } from "@/components/month-date-picker";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function ReportsPage({
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

  const savingsRate =
    data.totalIncome > 0 ? Math.max(0, Math.round((data.netCashFlow / data.totalIncome) * 100)) : 0;

  const monthlyHistory = data.monthlyHistory || [];
  const maxChartVal = Math.max(
    ...monthlyHistory.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Reports" fallbackHref="/dashboard" />

      {/* Header matching Figma desktop-reports */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Reports</h1>
          <p className="text-xs text-zinc-500">
            In-depth summary analysis of your cash flow, savings rate, and category outflows.
          </p>
        </div>

        {/* Interactive Month & Date Selector Popover */}
        <MonthDatePicker
          currentMonth={selectedMonth}
          baseUrl="/reports"
          prevMonthKey={prevMonthKey}
          nextMonthKey={nextMonthKey}
        />
      </div>

      {/* 4 Summary Cards matching Figma desktop-reports */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Total Income */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Total Inflows
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Verified
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 lg:text-3xl">
            +{formatNaira(data.totalIncome)}
          </p>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Total Outflows
            </span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              Expenses
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900 lg:text-3xl">
            -{formatNaira(data.totalExpenses)}
          </p>
        </div>

        {/* Card 3: Net Cash Flow */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Net Surplus / Margin
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                data.netCashFlow >= 0
                  ? "bg-brand-50 text-brand-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {data.netCashFlow >= 0 ? "Surplus" : "Deficit"}
            </span>
          </div>
          <p
            className={`mt-3 text-2xl font-bold lg:text-3xl ${
              data.netCashFlow >= 0 ? "text-brand-600" : "text-rose-600"
            }`}
          >
            {data.netCashFlow >= 0 ? "+" : ""}
            {formatNaira(data.netCashFlow)}
          </p>
        </div>

        {/* Card 4: Savings Rate */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Savings Rate
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Ratio
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900 lg:text-3xl">{savingsRate}%</p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Cash Flow Trend Chart (7/12 cols) */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Historical Cash Flow (6 Months)</h2>
              <p className="text-xs text-zinc-400">Calculated directly from your logged transaction history.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-brand-500" />
                <span className="text-zinc-600 font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-400" />
                <span className="text-zinc-600 font-medium">Expenses</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-3 pt-4">
            {monthlyHistory.map((item, idx) => {
              const incHeight = maxChartVal > 0 ? Math.max(4, Math.round((item.income / maxChartVal) * 100)) : 4;
              const expHeight = maxChartVal > 0 ? Math.max(4, Math.round((item.expense / maxChartVal) * 100)) : 4;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t-xs bg-brand-500 transition-all hover:opacity-80 sm:w-4"
                      style={{ height: `${incHeight}%` }}
                      title={`Income: ${formatNaira(item.income)}`}
                    />
                    <div
                      className="w-3 rounded-t-xs bg-rose-400 transition-all hover:opacity-80 sm:w-4"
                      style={{ height: `${expHeight}%` }}
                      title={`Expenses: ${formatNaira(item.expense)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">{item.monthName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Category Spending Distribution (5/12 cols) */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h2 className="text-sm font-bold text-zinc-900">Spending by Category</h2>
            <span className="text-xs text-zinc-400 font-semibold">{monthDisplayName}</span>
          </div>

            <div className="space-y-3.5">
              {data.budgetHealth.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No category expense records found.</p>
              ) : (
                data.budgetHealth.map((cat) => {
                  const spendPercent =
                    data.totalExpenses > 0
                      ? Math.min(100, Math.round((cat.spent / data.totalExpenses) * 100))
                      : 0;
                  return (
                    <div key={cat.bucketId} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-zinc-900">{cat.bucketName}</span>
                        <span className="text-zinc-500 font-bold">
                          {formatNaira(cat.spent)}
                          {data.totalExpenses > 0 && cat.spent > 0 && (
                            <span className="text-[10px] text-zinc-400 font-normal ml-1">
                              ({spendPercent}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <ProgressBar
                        percent={spendPercent}
                        tone={cat.warning ? "danger" : "brand"}
                        className="h-1.5"
                      />
                    </div>
                  );
                })
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
