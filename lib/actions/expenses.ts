"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { celebrateFirstExpense, celebrateTithePaid } from "@/lib/celebrations/evaluate";

export async function recordExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const txn_date = String(formData.get("txn_date") || "");
  const bucket_id = String(formData.get("bucket_id") || "") || null;
  const reason = String(formData.get("reason") || "");
  const vendor = String(formData.get("vendor") || "");
  const payment_account_id = String(formData.get("payment_account_id") || "") || null;
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "");
  const receipt_status = String(formData.get("receipt_status") || "unpaid");

  if (!txn_date || !amount || amount <= 0) {
    throw new Error("Date and a positive amount are required.");
  }

  const { error } = await supabase.from("expense_transactions").insert({
    user_id: user!.id,
    txn_date,
    bucket_id,
    reason,
    vendor,
    payment_account_id,
    amount,
    description,
    receipt_status,
  });

  if (error) throw new Error(error.message);

  const { count: expenseCount } = await supabase
    .from("expense_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);
  if (expenseCount === 1) {
    await celebrateFirstExpense(supabase, user!.id);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("expense_transactions")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", user!.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}

/** Toggle a single allocation between pending and sent — Phase 6, the core new feature.
 *  Called from a client component via startTransition, not bound directly as a form
 *  action, so returning a result object here is fine (and desired, for optimistic UI). */
export async function setAllocationStatus(allocationId: string, status: "pending" | "sent") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("allocations")
    .update({ status, sent_at: status === "sent" ? new Date().toISOString() : null })
    .eq("id", allocationId)
    .eq("user_id", user!.id);

  if (error) return { error: error.message };

  if (status === "sent") {
    const { data: alloc } = await supabase
      .from("allocations")
      .select("planned_amount, budget_buckets(name)")
      .eq("id", allocationId)
      .single();
    if ((alloc as any)?.budget_buckets?.name === "Tithe") {
      await celebrateTithePaid(supabase, user!.id, allocationId, Number(alloc!.planned_amount));
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/celebrations");
  return { success: true };
}
