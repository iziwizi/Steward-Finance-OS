"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export async function createBill(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const amount = Number(formData.get("amount") || 0);
  const frequency = String(formData.get("frequency") || "monthly");
  const due_date = String(formData.get("due_date") || "") || null;
  const account_id = String(formData.get("account_id") || "") || null;
  const auto_create_expense = formData.get("auto_create_expense") === "on";

  if (!name || !amount || amount <= 0) throw new Error("Name and a positive amount are required.");

  const { error } = await supabase.from("bills").insert({
    user_id: user.id,
    name,
    category,
    amount,
    frequency,
    due_date,
    next_due: due_date,
    account_id,
    auto_create_expense,
    status: "active",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/bills");
  redirect("/bills");
}

/** Always invoked from an inline wrapper (`action={async () => { "use server"; await markBillPaid(id) }}`),
 *  never bound directly, so returning a result object here is fine. */
export async function markBillPaid(billId: string) {
  const { supabase, user } = await requireUser();
  const { data: bill } = await supabase
    .from("bills")
    .select("frequency, next_due")
    .eq("id", billId)
    .eq("user_id", user.id)
    .single();
  if (!bill) return { error: "Bill not found." };

  const today = new Date().toISOString().slice(0, 10);
  const next = new Date(bill.next_due ?? today);
  if (bill.frequency === "monthly") next.setMonth(next.getMonth() + 1);
  else if (bill.frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
  else if (bill.frequency === "weekly") next.setDate(next.getDate() + 7);

  const { error } = await supabase
    .from("bills")
    .update({ last_paid_date: today, next_due: next.toISOString().slice(0, 10) })
    .eq("id", billId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/bills");
  return { success: true };
}

export async function createSubscription(formData: FormData) {
  const { supabase, user } = await requireUser();
  const service_name = String(formData.get("service_name") || "");
  const category = String(formData.get("category") || "");
  const plan = String(formData.get("plan") || "");
  const cost = Number(formData.get("cost") || 0);
  const billing_cycle = String(formData.get("billing_cycle") || "monthly");
  const next_renewal_date = String(formData.get("next_renewal_date") || "") || null;

  if (!service_name || !cost || cost <= 0) throw new Error("Service name and a positive cost are required.");

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    service_name,
    category,
    plan,
    cost,
    billing_cycle,
    next_renewal_date,
    status: "active",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

export async function createJournalEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entry_date = String(formData.get("entry_date") || new Date().toISOString().slice(0, 10));
  const did_well = String(formData.get("did_well") || "");
  const mistakes = String(formData.get("mistakes") || "");
  const surprises = String(formData.get("surprises") || "");
  const improve_next_month = String(formData.get("improve_next_month") || "");
  const grateful_for = String(formData.get("grateful_for") || "");

  const { data, error } = await supabase.from("financial_journal_entries").insert({
    user_id: user.id,
    entry_date,
    did_well,
    mistakes,
    surprises,
    improve_next_month,
    grateful_for,
  }).select().single();

  if (error) throw new Error(error.message);

  revalidatePath("/journal");
  return { success: true, entry: data };
}

export async function updateJournalEntry(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Entry ID is required");

  const entry_date = String(formData.get("entry_date") || new Date().toISOString().slice(0, 10));
  const did_well = String(formData.get("did_well") || "");
  const mistakes = String(formData.get("mistakes") || "");
  const surprises = String(formData.get("surprises") || "");
  const improve_next_month = String(formData.get("improve_next_month") || "");
  const grateful_for = String(formData.get("grateful_for") || "");

  const { data, error } = await supabase
    .from("financial_journal_entries")
    .update({
      entry_date,
      did_well,
      mistakes,
      surprises,
      improve_next_month,
      grateful_for,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/journal");
  return { success: true, entry: data };
}

export async function deleteJournalEntry(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/journal");
  return { success: true };
}

export async function updateNotificationPrefs(formData: FormData) {
  const { supabase, user } = await requireUser();
  const notification_email = String(formData.get("notification_email") || "");
  const reminder_days_before_bill = Number(formData.get("reminder_days_before_bill") || 3);
  const reminder_days_before_subscription = Number(
    formData.get("reminder_days_before_subscription") || 3
  );

  const { error } = await supabase
    .from("profiles")
    .update({ notification_email, reminder_days_before_bill, reminder_days_before_subscription })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function updateBill(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const amount = Number(formData.get("amount") || 0);
  const frequency = String(formData.get("frequency") || "monthly");
  const due_date = String(formData.get("due_date") || "") || null;

  if (!id || !name || !amount || amount <= 0) throw new Error("Name and amount are required.");

  const { error } = await supabase
    .from("bills")
    .update({ name, category, amount, frequency, due_date, next_due: due_date })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/bills");
}

export async function deleteBill(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/bills");
}

export async function updateSubscription(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const service_name = String(formData.get("service_name") || "");
  const category = String(formData.get("category") || "");
  const plan = String(formData.get("plan") || "");
  const cost = Number(formData.get("cost") || 0);
  const billing_cycle = String(formData.get("billing_cycle") || "monthly");

  if (!id || !service_name || !cost || cost <= 0) throw new Error("Service name and cost are required.");

  const { error } = await supabase
    .from("subscriptions")
    .update({ service_name, category, plan, cost, billing_cycle })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/subscriptions");
}

export async function deleteSubscription(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/subscriptions");
}

export async function updateAsset(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const current_value = Number(formData.get("current_value") || 0);
  const purchase_price = Number(formData.get("purchase_price") || 0);
  const location = String(formData.get("location") || "");

  if (!id || !name) throw new Error("Name is required.");

  const { error } = await supabase
    .from("assets")
    .update({ name, category, current_value, purchase_price, location })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/assets");
}

export async function deleteAsset(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("assets").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/assets");
}

export async function createAsset(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const purchase_date = String(formData.get("purchase_date") || "") || null;
  const purchase_price = Number(formData.get("purchase_price") || 0);
  const current_value = Number(formData.get("current_value") || 0);
  const quantity = Number(formData.get("quantity") || 1);
  const location = String(formData.get("location") || "");

  if (!name) throw new Error("Name is required.");

  const { error } = await supabase.from("assets").insert({
    user_id: user.id,
    name,
    category,
    purchase_date,
    purchase_price,
    current_value,
    quantity,
    location,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/assets");
  redirect("/assets");
}

export async function updateWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const item_name = String(formData.get("item_name") || "");
  const category = String(formData.get("category") || "");
  const estimated_cost = Number(formData.get("estimated_cost") || 0);
  const priority = String(formData.get("priority") || "Medium");

  if (!id || !item_name) throw new Error("Item name is required.");

  const { error } = await supabase
    .from("wishlist_items")
    .update({ item_name, category, estimated_cost, priority })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist");
}

export async function deleteWishlistItem(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("wishlist_items").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/wishlist");
}

export async function createWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const item_name = String(formData.get("item_name") || "");
  const category = String(formData.get("category") || "");
  const estimated_cost = Number(formData.get("estimated_cost") || 0);
  const priority = String(formData.get("priority") || "Medium");

  if (!item_name) throw new Error("Item name is required.");

  const { error } = await supabase.from("wishlist_items").insert({
    user_id: user.id,
    item_name,
    category,
    estimated_cost,
    priority,
    status: "active",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/wishlist");
  redirect("/wishlist");
}
