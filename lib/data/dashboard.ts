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

export async function getDashboardData(period: PeriodPreset = "current_month") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { start, end } = resolvePeriod(period);

  const [incomeRes, expenseRes, allocRes, bucketsRes, goalsRes, billsRes] = await Promise.all([
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
  for (const a of allocations) {
    allocatedByBucket.set(
      a.bucket_id,
      (allocatedByBucket.get(a.bucket_id) ?? 0) + Number(a.planned_amount)
    );
  }
  const budgetHealth = calculateBudgetHealth(
    buckets
      .filter((b) => b.is_income_split)
      .map((b) => ({
        bucketId: b.id,
        bucketName: b.name,
        allocated: allocatedByBucket.get(b.id) ?? 0,
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
    recentIncome: income.slice(0, 5),
    recentExpenses: expenses.slice(0, 5),
    latestCelebration,
  };
}
