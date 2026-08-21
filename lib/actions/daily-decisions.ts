"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateIncomeAllocations, type Bucket } from "@/lib/finance/allocation-engine";
import { celebrateFirstIncome, celebrateFirstExpense } from "@/lib/celebrations/evaluate";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export interface DailyDecisionRecord {
  id?: string;
  decision_date: string;
  had_income: boolean;
  had_expenses: boolean;
  created_goal: boolean;
  primary_action?: string;
  completed_at?: string;
}

export async function saveDailyDecision(data: {
  had_income: boolean;
  had_expenses: boolean;
  created_goal: boolean;
  primary_action?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("daily_decisions").upsert(
      {
        user_id: user.id,
        decision_date: today,
        had_income: data.had_income,
        had_expenses: data.had_expenses,
        created_goal: data.created_goal,
        primary_action: data.primary_action || "none",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,decision_date" }
    );

    if (error) {
      console.warn("Save daily decision note:", error);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save daily check-in." };
  }
}

export async function quickRecordIncome(data: {
  amount: number;
  description: string;
  source?: string;
  account_id?: string | null;
  txn_date?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const txn_date = data.txn_date || new Date().toISOString().slice(0, 10);
    const source = data.source || data.description || "Daily Income";
    const amount = Number(data.amount);
    const description = data.description || source;
    const account_id = data.account_id || null;

    if (!amount || amount <= 0) {
      return { success: false, error: "Please enter a valid positive amount." };
    }

    // 1. Insert income transaction
    const { data: income, error: incomeError } = await supabase
      .from("income_transactions")
      .insert({
        user_id: user.id,
        txn_date,
        source,
        account_id,
        amount,
        description,
      })
      .select("id")
      .single();

    if (incomeError || !income) {
      return { success: false, error: incomeError?.message || "Could not record income." };
    }

    // 2. Fetch buckets and compute allocations
    const { data: bucketRows } = await supabase
      .from("budget_buckets")
      .select("id, name, target_percent, is_income_split")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const buckets: Bucket[] = (bucketRows ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      targetPercent: Number(b.target_percent),
      isIncomeSplit: b.is_income_split,
    }));

    const allocations = calculateIncomeAllocations(amount, buckets);
    if (allocations.length > 0) {
      const rows = allocations.map((a) => ({
        user_id: user.id,
        income_transaction_id: income.id,
        bucket_id: a.bucketId,
        planned_amount: a.plannedAmount,
        status: "pending",
      }));
      await supabase.from("allocations").insert(rows);
    }

    // 3. Check celebration
    const { count: incomeCount } = await supabase
      .from("income_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (incomeCount === 1) {
      await celebrateFirstIncome(supabase, user.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/allocations");
    revalidatePath("/reports");
    return { success: true, id: income.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record income." };
  }
}

export async function quickRecordExpense(data: {
  amount: number;
  description?: string;
  reason?: string;
  vendor?: string;
  bucket_id?: string | null;
  payment_account_id?: string | null;
  txn_date?: string;
  receipt_status?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const txn_date = data.txn_date || new Date().toISOString().slice(0, 10);
    const amount = Number(data.amount);
    const reason = data.reason || data.description || "Daily Expense";
    const description = data.description || reason;
    const vendor = data.vendor || "";
    const bucket_id = data.bucket_id || null;
    const payment_account_id = data.payment_account_id || null;
    const receipt_status = data.receipt_status || "paid";

    if (!amount || amount <= 0) {
      return { success: false, error: "Please enter a valid positive amount." };
    }

    const { data: expense, error } = await supabase
      .from("expense_transactions")
      .insert({
        user_id: user.id,
        txn_date,
        bucket_id,
        reason,
        vendor,
        payment_account_id,
        amount,
        description,
        receipt_status,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const { count: expenseCount } = await supabase
      .from("expense_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (expenseCount === 1) {
      await celebrateFirstExpense(supabase, user.id);
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");
    return { success: true, id: expense?.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record expense." };
  }
}

export async function quickCreateGoal(data: {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  category?: string;
  bucket_id?: string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const name = data.name.trim();
    const target_amount = Number(data.target_amount);
    const current_amount = Number(data.current_amount || 0);
    const target_date = data.target_date || null;
    const category = data.category || "Savings";
    const bucket_id = data.bucket_id || null;

    if (!name || !target_amount || target_amount <= 0) {
      return { success: false, error: "Goal name and a positive target amount are required." };
    }

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        name,
        category,
        bucket_id,
        priority: "medium",
        target_amount,
        current_amount,
        target_date,
        status: current_amount >= target_amount ? "completed" : current_amount > 0 ? "in_progress" : "not_started",
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return { success: true, id: goal?.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create goal." };
  }
}
