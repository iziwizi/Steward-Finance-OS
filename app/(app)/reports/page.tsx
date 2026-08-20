import { TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function ReportsPage() {
  const data = await getDashboardData("current_month");

  const savingsRate =
    data.totalIncome > 0 ? Math.round((data.netCashFlow / data.totalIncome) * 100) : 0;

  const monthlyHistory = [
    { month: "Jan", income: 320, expense: 95 },
    { month: "Feb", income: 320, expense: 110 },
    { month: "Mar", income: 330, expense: 88 },
    { month: "Apr", income: 340, expense: 102 },
    { month: "May", income: 340, expense: 78 },
    { month: "Jun", income: 350, expense: 92 },
    { month: "Jul", income: 350, expense: 85 },
    {
      month: "Aug",
      income: Math.round(data.totalIncome / 1000) || 350,
      expense: Math.round(data.totalExpenses / 1000) || 84,
    },
  ];
  const maxChartVal = Math.max(...monthlyHistory.map((m) => Math.max(m.income, m.expense)), 360);

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-reports */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Reports</h1>
          <p className="text-xs text-zinc-500">
            In-depth summary analysis of your cash flow and allocation health.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>August 2026</span>
        </div>
      </div>

      {/* 4 Summary Cards matching Figma desktop-reports */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Total Income */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Monthly Total Income
            </span>
            <span className="text-[10px] font-bold text-emerald-600">+12.4% vs July</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900 lg:text-3xl">
            {formatNaira(data.totalIncome)}
          </p>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Monthly Expenses
            </span>
            <span className="text-[10px] font-bold text-emerald-600">-4.2% vs July</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-zinc-900 lg:text-3xl">
            {formatNaira(data.totalExpenses)}
          </p>
        </div>

        {/* Card 3: Net Savings Cash Flow */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Net Savings Cash Flow
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Healthy Reserve
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 lg:text-3xl">
            {formatNaira(data.netCashFlow)}
          </p>
        </div>

        {/* Card 4: Estimated Savings Rate */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Estimated Savings Rate
            </span>
            <span className="text-[10px] font-bold text-brand-600">Target: 50%+</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-600 lg:text-3xl">
            {savingsRate > 0 ? `${savingsRate}%` : "75.8%"}
          </p>
        </div>
      </div>

      {/* Grid Row 2: Cash Flow History Chart (60%) + Expense Breakdown Donut (40%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cash Flow History */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Cash Flow History</h2>
              <p className="text-xs text-zinc-400">Comparing monthly income and expenses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-brand-500" />
                <span className="text-zinc-600 font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
                <span className="text-zinc-600 font-medium">Expenses</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-2 pt-4">
            {monthlyHistory.map((item, idx) => {
              const incHeight = Math.max(12, Math.round((item.income / maxChartVal) * 100));
              const expHeight = Math.max(8, Math.round((item.expense / maxChartVal) * 100));
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t-xs bg-brand-500 sm:w-4"
                      style={{ height: `${incHeight}%` }}
                    />
                    <div
                      className="w-3 rounded-t-xs bg-rose-400 sm:w-4"
                      style={{ height: `${expHeight}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Expense Breakdown</h2>
            <p className="text-xs text-zinc-400">Visualized distribution of expenses</p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-brand-500 border-r-emerald-400 border-b-amber-400">
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-900">
                  ₦{Math.round(data.totalExpenses / 1000) || 84.6}k
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Tithe & Giving
              </span>
              <span className="font-bold text-zinc-900">41.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Rent & Utilities
              </span>
              <span className="font-bold text-zinc-900">24.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Food & Dining
              </span>
              <span className="font-bold text-zinc-900">16.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Month-over-Month Growth (60%) + Top Spending Categories (40%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Month-over-Month Growth Table */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-8">
          <h2 className="text-sm font-bold text-zinc-900 mb-3">Month-over-Month Growth</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3 text-right">July 2026</th>
                <th className="py-2.5 px-3 text-right">August 2026</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-900">Total Income Received</td>
                <td className="py-3 px-3 text-right text-zinc-500">₦311,300</td>
                <td className="py-3 px-3 text-right font-bold text-zinc-900">₦350,000</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600">+12.4%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-900">Allocated Expenses</td>
                <td className="py-3 px-3 text-right text-zinc-500">₦88,300</td>
                <td className="py-3 px-3 text-right font-bold text-zinc-900">₦84,600</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600">-4.2%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-900">Investment Contributions</td>
                <td className="py-3 px-3 text-right text-zinc-500">₦20,000</td>
                <td className="py-3 px-3 text-right font-bold text-zinc-900">₦25,000</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600">+25.0%</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-900">Net Positive Reserve</td>
                <td className="py-3 px-3 text-right text-zinc-500">₦203,000</td>
                <td className="py-3 px-3 text-right font-bold text-zinc-900">₦240,400</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600">+18.4%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Spending Categories */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-3.5">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
            Top Spending Categories
          </h2>

          <div className="space-y-3">
            {[
              { name: "Tithe & Giving", amount: "₦35,000", pct: 100 },
              { name: "Rent & Utilities", amount: "₦20,500", pct: 60 },
              { name: "Food & Dining", amount: "₦14,200", pct: 40 },
              { name: "Transport (Uber/Bolt)", amount: "₦4,300", pct: 15 },
              { name: "Entertainment (Netflix/Spotify)", amount: "₦7,000", pct: 20 },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-700">{cat.name}</span>
                  <span className="font-bold text-zinc-900">{cat.amount}</span>
                </div>
                <ProgressBar percent={cat.pct} tone="brand" className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
