import Link from "next/link";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { createClient } from "@/lib/supabase/server";
import { markCelebrationSeen } from "@/lib/actions/celebrations";
import { getTimeOfDayGreeting, getUserFirstName } from "@/lib/utils/greeting";
import { Sparkles, Zap, Calendar } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TodaysDecisions } from "@/components/todays-decisions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: todayDecision },
    { data: todayIncome },
    { data: todayExpense },
    { data: userAccounts },
    { data: userBuckets },
    data,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id).maybeSingle(),
    supabase
      .from("daily_decisions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("decision_date", todayStr)
      .maybeSingle(),
    supabase
      .from("income_transactions")
      .select("id")
      .eq("user_id", user?.id)
      .eq("txn_date", todayStr)
      .limit(1),
    supabase
      .from("expense_transactions")
      .select("id")
      .eq("user_id", user?.id)
      .eq("txn_date", todayStr)
      .limit(1),
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", user?.id)
      .eq("is_active", true),
    supabase
      .from("budget_buckets")
      .select("id, name")
      .eq("user_id", user?.id)
      .eq("is_active", true),
    getDashboardData("current_month"),
  ]);

  const firstName = getUserFirstName(profile?.full_name, user?.email);
  const timeGreeting = getTimeOfDayGreeting();

  const hasIncomeToday = (todayIncome ?? []).length > 0;
  const hasExpensesToday = (todayExpense ?? []).length > 0;

  // Build combined recent transactions table data
  const recentTransactions = [
    ...data.recentIncome.map((i) => ({
      id: `inc-${i.id}`,
      date: new Date(i.txn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      description: i.description || i.source || "Income Deposit",
      category: "Income",
      account: (i.accounts as { name?: string } | null)?.name || "Main Account",
      status: "Cleared",
      amount: Number(i.amount),
      isIncome: true,
      rawDate: i.txn_date,
    })),
    ...data.recentExpenses.map((e: any) => ({
      id: `exp-${e.id}`,
      date: new Date(e.txn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      description: e.description || e.vendor || e.reason || "Expense",
      category: (e.budget_buckets as { name?: string } | null)?.name || "General",
      account: "Pocket Wallet",
      status: e.receipt_status === "verified" ? "Cleared" : "Pending",
      amount: Number(e.amount),
      isIncome: false,
      rawDate: e.txn_date,
    })),
  ]
    .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
    .slice(0, 6);

  // Historical cash flow comparison for the 8-month chart shown in Figma
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
      {/* Top Welcome Header with Dynamic Time-of-Day Greeting & User Name */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">
            {timeGreeting}, {firstName}
          </h1>
          <p className="text-xs text-zinc-500">
            Here is your financial workspace for today.
          </p>
        </div>
      </div>

      {/* Today's Decisions Section with Inline Quick Actions */}
      <TodaysDecisions
        existingDecision={todayDecision ?? null}
        hasIncomeToday={hasIncomeToday}
        hasExpensesToday={hasExpensesToday}
        accounts={userAccounts ?? []}
        buckets={userBuckets ?? []}
      />

      {/* Celebration Banner if present */}
      {data.latestCelebration && (
        <form
          action={async () => {
            "use server";
            await markCelebrationSeen(data.latestCelebration!.id);
          }}
        >
          <button
            type="submit"
            className="tap-target flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-zinc-900">{data.latestCelebration.title}</p>
              <p className="text-xs text-zinc-600">{data.latestCelebration.message}</p>
            </div>
            <span className="text-xs font-semibold text-amber-700">Dismiss</span>
          </button>
        </form>
      )}

      {/* 4 Metrics Cards Row — Matching Figma desktop-dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Available Cash (Dark Teal) */}
        <div className="flex flex-col justify-between rounded-xl bg-brand-500 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
              Available Cash
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              {formatNaira(data.availableCash)}
            </p>
          </div>
        </div>

        {/* Card 2: Income (White) */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Income
            </span>
            <span className="text-[11px] font-bold text-emerald-600">+12.4%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-zinc-900 lg:text-3xl">
              {formatNaira(data.totalIncome)}
            </p>
          </div>
        </div>

        {/* Card 3: Expenses (White) */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Expenses
            </span>
            <span className="text-[11px] font-bold text-rose-500">-4.2%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-zinc-900 lg:text-3xl">
              {formatNaira(data.totalExpenses)}
            </p>
          </div>
        </div>

        {/* Card 4: Net Cash Flow (White) */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Net Cash Flow
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Healthy
            </span>
          </div>
          <div className="mt-3">
            <p
              className={`text-2xl font-bold tracking-tight lg:text-3xl ${
                data.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {data.netCashFlow >= 0 ? "+" : ""}
              {formatNaira(data.netCashFlow)}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 60% Column: Cash Flow History + Recent Transactions */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card: Cash Flow History Chart */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Cash Flow History</h2>
                <p className="text-xs text-zinc-400">
                  Comparing income & expenses (Jan - Aug 2026)
                </p>
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

            {/* CSS Bar Chart */}
            <div className="mt-6 flex h-44 items-end justify-between gap-2 pt-4">
              {monthlyHistory.map((item, idx) => {
                const incHeight = Math.max(12, Math.round((item.income / maxChartVal) * 100));
                const expHeight = Math.max(8, Math.round((item.expense / maxChartVal) * 100));
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end justify-center gap-1">
                      <div
                        className="w-2.5 rounded-t-xs bg-brand-500 transition-all duration-fast hover:opacity-80 sm:w-3.5"
                        style={{ height: `${incHeight}%` }}
                        title={`Income: ₦${item.income}k`}
                      />
                      <div
                        className="w-2.5 rounded-t-xs bg-rose-400 transition-all duration-fast hover:opacity-80 sm:w-3.5"
                        style={{ height: `${expHeight}%` }}
                        title={`Expenses: ₦${item.expense}k`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Recent Transactions Table */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-sm font-bold text-zinc-900">Recent Transactions</h2>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View Ledger
              </Link>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Category</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Account</th>
                    <th className="py-2.5 pl-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-zinc-400">
                        No transactions recorded yet this month.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id} className="transition-colors hover:bg-zinc-50/70">
                        <td className="py-3 pr-3 text-zinc-500 font-medium">{tx.date}</td>
                        <td className="py-3 px-3 font-semibold text-zinc-900">{tx.description}</td>
                        <td className="py-3 px-3 text-zinc-500 hidden sm:table-cell">
                          {tx.category}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 hidden md:table-cell">
                          {tx.account}
                        </td>
                        <td
                          className={`py-3 pl-3 text-right font-bold ${
                            tx.isIncome ? "text-emerald-600" : "text-zinc-900"
                          }`}
                        >
                          {tx.isIncome ? "+" : "-"}
                          {formatNaira(tx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 40% Column: Allocation Health, Active Goals, Upcoming Obligations */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Allocation Health */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Allocation Health</h2>
              <Link
                href="/settings?tab=allocations"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Configure
              </Link>
            </div>

            <div className="mt-4 space-y-3.5">
              {data.budgetHealth.length === 0 ? (
                <p className="text-xs text-zinc-400 py-2">No active budget buckets configured.</p>
              ) : (
                data.budgetHealth.map((b) => (
                  <div key={b.bucketId} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-900">{b.bucketName}</span>
                      <span className="text-zinc-400 text-[11px]">
                        {formatNaira(b.spent)} / {formatNaira(b.allocated)}
                      </span>
                    </div>
                    <ProgressBar
                      percent={b.percentUsed}
                      tone={b.warning ? "danger" : b.percentUsed >= 100 ? "income" : "brand"}
                      className="h-1.5"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Active Goals */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Active Goals</h2>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                {data.goals.length} Active
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {data.goals.length === 0 ? (
                <p className="py-2 text-xs text-zinc-400">No active financial goals set up.</p>
              ) : (
                data.goals.slice(0, 3).map((g) => {
                  const { progressPercent } = calculateGoalProgress(
                    Number(g.target_amount),
                    Number(g.current_amount)
                  );
                  return (
                    <div
                      key={g.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{g.name}</p>
                          <p className="text-[10px] text-zinc-400">
                            {g.target_date ? `Target: ${g.target_date}` : "Ongoing"}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brand-600">
                          {progressPercent}%
                        </span>
                      </div>

                      <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-800">
                          {formatNaira(Number(g.current_amount))}
                        </span>
                        <span>of {formatNaira(Number(g.target_amount))}</span>
                      </div>

                      <ProgressBar percent={progressPercent} tone="brand" className="mt-1.5 h-1.5" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 3: Upcoming Obligations */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Upcoming Obligations</h2>
              <Link
                href="/bills"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View All
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
                        <p className="text-[10px] text-zinc-400">Due day {b.due_day}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-900">
                      {formatNaira(Number(b.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Insight Notification Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-200/80 bg-brand-50/70 p-4 shadow-xs">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <Zap className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium text-brand-950">
          Steward Insight: Your financial workspace is active. Record daily transactions and confirm envelopes to maintain high stewardship health.
        </p>
      </div>
    </div>
  );
}
