import { createClient } from "@/lib/supabase/server";
import {
  calculateNetCashFlow,
  calculateAvailableCash,
  calculateBudgetHealth,
  summarizeAllocations,
  resolvePeriod,
  type PeriodPreset,
} from "@/lib/finance/allocation-engine";
import { celebratePositiveCashFlow } from "@/lib/celebrations/evaluate";

export async function getDashboardData(
  period: PeriodPreset = "current_month",
  customRange?: { start: string; end: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { start, end } = customRange ? customRange : resolvePeriod(period);

  const [
    incomeRes,
    expenseRes,
    allocRes,
    bucketsRes,
    goalsRes,
    billsRes,
    allIncomeHistoryRes,
    allExpenseHistoryRes,
  ] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, txn_date, source, amount, description, accounts(name)")
      .eq("user_id", user.id)
      .gte("txn_date", start)
      .lte("txn_date", end)
      .order("txn_date", { ascending: false }),
    supabase
      .from("expense_transactions")
      .select("id, txn_date, reason, vendor, amount, description, bucket_id, budget_buckets(name)")
      .eq("user_id", user.id)
      .gte("txn_date", start)
      .lte("txn_date", end)
      .order("txn_date", { ascending: false }),
    supabase
      .from("allocations")
      .select("id, bucket_id, planned_amount, status, budget_buckets(name), income_transactions!inner(txn_date)")
      .eq("user_id", user.id)
      .gte("income_transactions.txn_date", start)
      .lte("income_transactions.txn_date", end),
    supabase.from("budget_buckets").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("goals").select("*").eq("user_id", user.id).order("target_date"),
    supabase.from("bills").select("*").eq("user_id", user.id).eq("status", "active"),
    // Historical trends for the last 6 months
    supabase
      .from("income_transactions")
      .select("txn_date, amount")
      .eq("user_id", user.id)
      .gte("txn_date", new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)),
    supabase
      .from("expense_transactions")
      .select("txn_date, amount")
      .eq("user_id", user.id)
      .gte("txn_date", new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)),
  ]);

  const income = incomeRes.data ?? [];
  const expenses = expenseRes.data ?? [];
  const allocations = allocRes.data ?? [];
  const buckets = bucketsRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const bills = billsRes.data ?? [];

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netCashFlow = calculateNetCashFlow({ totalIncome, totalExpenses });
  const allocationRecordsForCash = allocations.map((a: any) => ({
    status: a.status as "pending" | "sent",
    amount: Number(a.planned_amount),
  }));
  const totalSentAllocations = allocationRecordsForCash
    .filter((a) => a.status === "sent")
    .reduce((s, a) => s + a.amount, 0);
  const availableCash = calculateAvailableCash({
    totalIncome,
    totalExpenses,
    totalSentAllocations,
  });

  const allocationRecords = allocations.map((a: any) => ({
    bucketId: a.bucket_id,
    bucketName: a.budget_buckets?.name ?? "Unknown",
    plannedAmount: Number(a.planned_amount),
    status: a.status as "pending" | "sent",
  }));
  const allocationSummary = summarizeAllocations(allocationRecords);

  const spentByBucket = new Map<string, number>();
  for (const e of expenses) {
    if (!e.bucket_id) continue;
    spentByBucket.set(e.bucket_id, (spentByBucket.get(e.bucket_id) ?? 0) + Number(e.amount));
  }
  const allocatedByBucket = new Map<string, number>();
  const sentByBucket = new Map<string, number>();
  for (const a of allocations) {
    allocatedByBucket.set(
      a.bucket_id,
      (allocatedByBucket.get(a.bucket_id) ?? 0) + Number(a.planned_amount)
    );
    if (a.status === "sent") {
      sentByBucket.set(
        a.bucket_id,
        (sentByBucket.get(a.bucket_id) ?? 0) + Number(a.planned_amount)
      );
    }
  }
  const budgetHealth = calculateBudgetHealth(
    buckets
      .filter((b) => b.is_income_split)
      .map((b) => ({
        bucketId: b.id,
        bucketName: b.name,
        purpose: b.purpose || null,
        targetPercent: Number(b.target_percent || 0),
        allocated: allocatedByBucket.get(b.id) ?? 0,
        sent: sentByBucket.get(b.id) ?? 0,
        spent: spentByBucket.get(b.id) ?? 0,
      }))
  );

  const titheAllocations = allocationRecords.filter((a) => a.bucketName === "Tithe");
  const titheSummary = summarizeAllocations(titheAllocations);

  const pendingAllocations = allocationRecords.filter((a) => a.status === "pending");

  if (period === "current_month") {
    await celebratePositiveCashFlow(supabase, user.id, start.slice(0, 7), netCashFlow);
  }

  const { data: latestCelebration } = await supabase
    .from("celebrations")
    .select("*")
    .eq("user_id", user.id)
    .is("seen_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Compute 6-month real historical bars
  const historyMap: Record<string, { income: number; expense: number; monthName: string }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    historyMap[key] = {
      income: 0,
      expense: 0,
      monthName: monthNames[d.getMonth()],
    };
  }

  (allIncomeHistoryRes.data ?? []).forEach((i) => {
    const mKey = i.txn_date.slice(0, 7);
    if (historyMap[mKey]) {
      historyMap[mKey].income += Number(i.amount);
    }
  });

  (allExpenseHistoryRes.data ?? []).forEach((e) => {
    const mKey = e.txn_date.slice(0, 7);
    if (historyMap[mKey]) {
      historyMap[mKey].expense += Number(e.amount);
    }
  });

  const monthlyHistory = Object.values(historyMap);

  return {
    period: { start, end },
    totalIncome,
    totalExpenses,
    netCashFlow,
    availableCash,
    allocationSummary,
    pendingAllocations,
    budgetHealth,
    titheSummary,
    goals,
    bills,
    monthlyHistory,
    recentIncome: income.slice(0, 5),
    recentExpenses: expenses.slice(0, 5),
    latestCelebration,
  };
}
