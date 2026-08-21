"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateIncomeAllocations, type Bucket } from "@/lib/finance/allocation-engine";
import { celebrateFirstIncome } from "@/lib/celebrations/evaluate";

export async function recordIncome(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const txn_date = String(formData.get("txn_date") || "");
  const source = String(formData.get("source") || "");
  const account_id = String(formData.get("account_id") || "") || null;
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "");

  if (!txn_date || !source || !amount || amount <= 0) {
    throw new Error("Date, source, and a positive amount are required.");
  }

  // 1. Record the income transaction.
  const { data: income, error: incomeError } = await supabase
    .from("income_transactions")
    .insert({ user_id: user!.id, txn_date, source, account_id, amount, description })
    .select("id")
    .single();

  if (incomeError || !income) {
    throw new Error(incomeError?.message ?? "Could not record income.");
  }

  const { count: incomeCount } = await supabase
    .from("income_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);
  if (incomeCount === 1) {
    await celebrateFirstIncome(supabase, user!.id);
  }

  // 2. Load this user's current bucket configuration (editable per Phase 30 —
  //    never hard-coded) and run it through the single calculation engine.
  const { data: bucketRows, error: bucketError } = await supabase
    .from("budget_buckets")
    .select("id, name, target_percent, is_income_split")
    .eq("user_id", user!.id)
    .eq("is_active", true);

  if (bucketError) {
    throw new Error(bucketError.message);
  }

  const buckets: Bucket[] = (bucketRows ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    targetPercent: Number(b.target_percent),
    isIncomeSplit: b.is_income_split,
  }));

  const planned = calculateIncomeAllocations(amount, buckets);

  // 3. Insert every planned allocation as 'pending' — nothing is ever
  //    auto-marked as sent. The user marks it sent explicitly (Phase 6).
  if (planned.length > 0) {
    const { error: allocError } = await supabase.from("allocations").insert(
      planned.map((p) => ({
        user_id: user!.id,
        income_transaction_id: income.id,
        bucket_id: p.bucketId,
        planned_amount: p.plannedAmount,
        status: "pending" as const,
      }))
    );
    if (allocError) {
      throw new Error(allocError.message);
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createIncomeTransaction(
  formData: FormData
): Promise<{ success: boolean; amount?: number; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const txn_date = String(formData.get("txn_date") || "");
    const source = String(formData.get("source") || "");
    const account_id = String(formData.get("account_id") || "") || null;
    const amount = Number(formData.get("amount") || 0);
    const description = String(formData.get("description") || "");

    if (!txn_date || !source || !amount || amount <= 0) {
      return { success: false, error: "Date, source, and a positive amount are required." };
    }

    const { data: income, error: incomeError } = await supabase
      .from("income_transactions")
      .insert({ user_id: user.id, txn_date, source, account_id, amount, description })
      .select("id")
      .single();

    if (incomeError || !income) {
      return { success: false, error: incomeError?.message ?? "Could not record income." };
    }

    const { count: incomeCount } = await supabase
      .from("income_transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (incomeCount === 1) {
      await celebrateFirstIncome(supabase, user.id);
    }

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

    const planned = calculateIncomeAllocations(amount, buckets);

    if (planned.length > 0) {
      await supabase.from("allocations").insert(
        planned.map((p) => ({
          user_id: user.id,
          income_transaction_id: income.id,
          bucket_id: p.bucketId,
          planned_amount: p.plannedAmount,
          status: "pending" as const,
        }))
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/allocations");
    return { success: true, amount };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record income." };
  }
}

/** Deletes an income transaction and, via ON DELETE CASCADE, its allocations.
 *  Called from a confirm-gated client component, not bound directly as a
 *  form action, so a result object is fine here. */
export async function deleteIncome(incomeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("income_transactions")
    .delete()
    .eq("id", incomeId)
    .eq("user_id", user!.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}
