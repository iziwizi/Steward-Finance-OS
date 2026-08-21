import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";

export interface OperationalInsight {
  id: string;
  category: string;
  tag: string;
  tagTone: string;
  title: string;
  desc: string;
  borderTone: string;
}

export async function getRealOperationalInsights(userId: string): Promise<OperationalInsight[]> {
  const supabase = await createClient();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

  const [
    currentIncomeRes,
    currentExpenseRes,
    prevExpenseRes,
    bucketsRes,
    goalsRes,
    subsRes,
    allocationsRes,
  ] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("amount")
      .eq("user_id", userId)
      .gte("txn_date", currentMonthStart)
      .lte("txn_date", currentMonthEnd),
    supabase
      .from("expense_transactions")
      .select("amount, bucket_id, budget_buckets(name)")
      .eq("user_id", userId)
      .gte("txn_date", currentMonthStart)
      .lte("txn_date", currentMonthEnd),
    supabase
      .from("expense_transactions")
      .select("amount")
      .eq("user_id", userId)
      .gte("txn_date", prevMonthStart)
      .lte("txn_date", prevMonthEnd),
    supabase.from("budget_buckets").select("id, name, target_percent").eq("user_id", userId),
    supabase.from("goals").select("id, name, target_amount, current_amount").eq("user_id", userId),
    supabase.from("subscriptions").select("id, service_name, cost, billing_cycle").eq("user_id", userId).eq("status", "active"),
    supabase.from("allocations").select("id, planned_amount, status, budget_buckets(name)").eq("user_id", userId),
  ]);

  const currentIncomeTotal = (currentIncomeRes.data ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const currentExpenseTotal = (currentExpenseRes.data ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const prevExpenseTotal = (prevExpenseRes.data ?? []).reduce((s, e) => s + Number(e.amount), 0);

  const insights: OperationalInsight[] = [];

  // 1. Savings Rate & Cash Flow Insight (if user has income)
  if (currentIncomeTotal > 0) {
    const netSavings = currentIncomeTotal - currentExpenseTotal;
    const savingsRate = Math.max(0, Math.round((netSavings / currentIncomeTotal) * 100));

    let expenseComparison = "";
    if (prevExpenseTotal > 0) {
      const diffPct = Math.round(((currentExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100);
      expenseComparison = diffPct < 0 ? `Your expenses decreased by ${Math.abs(diffPct)}% compared to last month.` : `Your expenses increased by ${diffPct}% compared to last month.`;
    }

    insights.push({
      id: "savings-rate",
      category: "SAVINGS & CASH FLOW",
      tag: `${savingsRate}% savings rate`,
      tagTone: savingsRate >= 30 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold",
      title: savingsRate >= 30 ? "Strong Surplus Position" : "Moderate Cash Flow Margin",
      desc: `You have retained ${formatNaira(netSavings)} of ${formatNaira(currentIncomeTotal)} total income this month. ${expenseComparison}`,
      borderTone: savingsRate >= 30 ? "border-l-emerald-500" : "border-l-amber-500",
    });
  }

  // 2. Expense Category Breakdown (Find top category)
  const expensesByCategory: Record<string, number> = {};
  (currentExpenseRes.data ?? []).forEach((e: any) => {
    const name = e.budget_buckets?.name || "Uncategorized";
    expensesByCategory[name] = (expensesByCategory[name] || 0) + Number(e.amount);
  });

  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0 && currentExpenseTotal > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const topPct = Math.round((topAmount / currentExpenseTotal) * 100);
    insights.push({
      id: "top-expense",
      category: "PRIMARY OUTFLOW",
      tag: `${topPct}% of expenses`,
      tagTone: "text-zinc-700 font-bold",
      title: `Largest Outflow: ${topCat}`,
      desc: `${topCat} accounted for ${formatNaira(topAmount)} (${topPct}%) of your total ${formatNaira(currentExpenseTotal)} outflows this month.`,
      borderTone: "border-l-brand-500",
    });
  }

  // 3. Tithe & Kingdom Giving Status
  const titheAllocations = (allocationsRes.data ?? []).filter((a: any) =>
    a.budget_buckets?.name?.toLowerCase().includes("tithe") ||
    a.budget_buckets?.name?.toLowerCase().includes("giving")
  );
  if (titheAllocations.length > 0) {
    const allSent = titheAllocations.every((a: any) => a.status === "sent");
    const totalTithe = titheAllocations.reduce((s: number, a: any) => s + Number(a.planned_amount), 0);
    insights.push({
      id: "tithe-status",
      category: "KINGDOM GIVING",
      tag: allSent ? "100% Dispatched" : "Pending Action",
      tagTone: allSent ? "text-emerald-700 font-bold" : "text-amber-700 font-bold",
      title: allSent ? "Tithe & Giving Fully Allocated" : "Pending Tithe Disbursement",
      desc: allSent
        ? `Your tithe and partnership allocations of ${formatNaira(totalTithe)} are fully confirmed and disbursed.`
        : `You have ${formatNaira(totalTithe)} planned in tithe and giving envelopes awaiting confirmation.`,
      borderTone: allSent ? "border-l-emerald-500" : "border-l-amber-500",
    });
  }

  // 4. Goals & Emergency Reserve
  const emergencyGoal = (goalsRes.data ?? []).find((g) =>
    g.name.toLowerCase().includes("emergency") || g.name.toLowerCase().includes("freedom")
  );
  if (emergencyGoal) {
    const curr = Number(emergencyGoal.current_amount);
    const target = Number(emergencyGoal.target_amount);
    const pct = target > 0 ? Math.round((curr / target) * 100) : 0;
    insights.push({
      id: "emergency-cushion",
      category: "EMERGENCY CUSHION",
      tag: `${pct}% funded`,
      tagTone: pct >= 50 ? "text-emerald-700 font-bold" : "text-blue-700 font-bold",
      title: `${emergencyGoal.name} Progress`,
      desc: `You have saved ${formatNaira(curr)} toward your ${formatNaira(target)} goal milestone.`,
      borderTone: "border-l-emerald-500",
    });
  }

  // 5. Subscriptions Management
  const subs = subsRes.data ?? [];
  if (subs.length > 0) {
    const totalSubsCost = subs.reduce((s, sub) => {
      const cost = Number(sub.cost);
      if (sub.billing_cycle === "yearly") return s + cost / 12;
      return s + cost;
    }, 0);

    insights.push({
      id: "subscriptions-audit",
      category: "SUBSCRIPTIONS AUDIT",
      tag: `${subs.length} Active Services`,
      tagTone: "text-zinc-700 font-bold",
      title: "Recurring Service Commitments",
      desc: `You have ${subs.length} active subscriptions totaling ${formatNaira(Math.round(totalSubsCost))}/month in fixed commitments.`,
      borderTone: "border-l-blue-500",
    });
  }

  return insights;
}
