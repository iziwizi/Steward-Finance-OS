"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calculateIncomeAllocations, type Bucket } from "@/lib/finance/allocation-engine";

/**
 * Imports the real transactions found in StewardOS_Personal_Finance during
 * the audit. Idempotent: every insert is preceded by an existence check on
 * a natural key, so running this twice never duplicates rows. Historical
 * allocations are marked 'sent' (these are closed prior periods, not open
 * decisions — the Monthly Cash Flow sheet confirms at least the June
 * savings were actually transferred). Review /transactions afterward and
 * flip any that weren't actually sent back to pending.
 */
export async function importStewardOsSeedData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const log: string[] = [];

  const { data: accountsRaw } = await supabase.from("accounts").select("id, name").eq("user_id", user.id);
  const accountId = (name: string) => accountsRaw?.find((a) => a.name === name)?.id ?? null;

  const { data: bucketsRaw } = await supabase
    .from("budget_buckets")
    .select("id, name, target_percent, is_income_split")
    .eq("user_id", user.id);
  const bucketId = (name: string) => bucketsRaw?.find((b) => b.name === name)?.id ?? null;
  const buckets: Bucket[] = (bucketsRaw ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    targetPercent: Number(b.target_percent),
    isIncomeSplit: b.is_income_split,
  }));

  // ---- Income ----
  const incomeRows = [
    { date: "2026-06-30", source: "Salary", account: "Zenith", amount: 240000, description: "June Salary from Mr Wale website maintenance" },
    { date: "2026-07-11", source: "WP Plugin Sale", account: "OPay", amount: 7000, description: "Sale of elementor pro plugin" },
    { date: "2026-07-17", source: "WP Theme Sale", account: "OPay", amount: 12000, description: "Sale of 2 WP theme" },
  ];
  for (const row of incomeRows) {
    const { data: existing } = await supabase
      .from("income_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("txn_date", row.date)
      .eq("source", row.source)
      .eq("amount", row.amount)
      .maybeSingle();
    if (existing) {
      log.push(`Skipped income "${row.source}" ${row.date} — already imported`);
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("income_transactions")
      .insert({
        user_id: user.id,
        txn_date: row.date,
        source: row.source,
        account_id: accountId(row.account),
        amount: row.amount,
        description: row.description,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      log.push(`Failed income "${row.source}": ${error?.message}`);
      continue;
    }
    const planned = calculateIncomeAllocations(row.amount, buckets);
    if (planned.length > 0) {
      await supabase.from("allocations").insert(
        planned.map((p) => ({
          user_id: user.id,
          income_transaction_id: inserted.id,
          bucket_id: p.bucketId,
          planned_amount: p.plannedAmount,
          status: "sent" as const, // historical, closed period — see note above
          sent_at: new Date(`${row.date}T00:00:00Z`).toISOString(),
        }))
      );
    }
    log.push(`Imported income "${row.source}" ${row.date} — ₦${row.amount.toLocaleString()}`);
  }

  // ---- Expenses ----
  const expenseRows = [
    { date: "2026-06-30", bucket: "Living Expenses", reason: "Groceries", vendor: "Shoprite", account: "OPay", amount: 20000, description: "Drinks and beverages", receipt: "paid" },
    { date: "2026-06-30", bucket: "Living Expenses", reason: "Data", vendor: "Opay App", account: "OPay", amount: 1000, description: "Two days sub to work on project", receipt: "paid" },
    { date: "2026-07-11", bucket: "Living Expenses", reason: "Bought Food", vendor: "Food Woman", account: "OPay", amount: 2200, description: "Breakfast and Launch", receipt: "paid" },
  ];
  for (const row of expenseRows) {
    const { data: existing } = await supabase
      .from("expense_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("txn_date", row.date)
      .eq("reason", row.reason)
      .eq("amount", row.amount)
      .maybeSingle();
    if (existing) {
      log.push(`Skipped expense "${row.reason}" ${row.date} — already imported`);
      continue;
    }
    const { error } = await supabase.from("expense_transactions").insert({
      user_id: user.id,
      txn_date: row.date,
      bucket_id: bucketId(row.bucket),
      reason: row.reason,
      vendor: row.vendor,
      payment_account_id: accountId(row.account),
      amount: row.amount,
      description: row.description,
      receipt_status: row.receipt,
    });
    log.push(
      error
        ? `Failed expense "${row.reason}": ${error.message}`
        : `Imported expense "${row.reason}" ${row.date} — ₦${row.amount.toLocaleString()}`
    );
  }

  // ---- Bills ----
  const { data: existingBill } = await supabase
    .from("bills")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", "Airtel Router subscription")
    .maybeSingle();
  if (!existingBill) {
    const { error } = await supabase.from("bills").insert({
      user_id: user.id,
      name: "Airtel Router subscription",
      category: "Monthly Data Sub",
      amount: 30000,
      frequency: "monthly",
      due_date: "2026-07-31",
      last_paid_date: "2026-06-29",
      next_due: "2026-07-29",
      account_id: accountId("OPay"),
      auto_create_expense: true,
      status: "active",
    });
    log.push(error ? `Failed bill: ${error.message}` : "Imported bill: Airtel Router subscription");
  } else {
    log.push("Skipped bill Airtel Router subscription — already imported");
  }

  // ---- Subscriptions ----
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("service_name", "Web Hosting Renewal")
    .maybeSingle();
  if (!existingSub) {
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      service_name: "Web Hosting Renewal",
      category: "Hosting",
      plan: "Monthly Shared Hosting",
      cost: 20000,
      billing_cycle: "monthly",
      next_renewal_date: "2026-07-12",
      status: "active",
    });
    log.push(error ? `Failed subscription: ${error.message}` : "Imported subscription: Web Hosting Renewal");
  } else {
    log.push("Skipped subscription Web Hosting Renewal — already imported");
  }

  // ---- Assets ----
  const assetRows = [
    { name: "Infinix Note 12i", category: "Mobile Phone", purchase_date: "2024-11-08", purchase_price: 125000, current_value: 200000, quantity: 1, location: "Bannex Plaza Abuja" },
    { name: "Plot of land (40/25)", category: "Real Estate", purchase_date: "2024-11-12", purchase_price: 600000, current_value: 3000000, quantity: 1, location: "Kpaduma 3, Asokoro extension, Abuja" },
  ];
  for (const row of assetRows) {
    const { data: existing } = await supabase
      .from("assets")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", row.name)
      .eq("purchase_date", row.purchase_date)
      .maybeSingle();
    if (existing) {
      log.push(`Skipped asset "${row.name}" — already imported`);
      continue;
    }
    const { error } = await supabase.from("assets").insert({ user_id: user.id, ...row });
    log.push(error ? `Failed asset "${row.name}": ${error.message}` : `Imported asset "${row.name}"`);
  }

  // ---- Goals ----
  // "New Apartment" and the sheet's "Rent for a one bedroom" row describe the
  // same Rent Fund goal (same target/current/date) — imported once. "Buy Polo"
  // is a separate, already-completed goal. "Airtel Router Monthly Sub" as a
  // goal is the same obligation as the Airtel Router bill above — intentionally
  // not duplicated as a goal.
  const goalRows = [
    { name: "New Apartment", category: "House Rent", bucket: "Rent Fund", priority: "High", target_amount: 1500000, current_amount: 100000, target_date: "2026-08-05", status: "in_progress" as const, completion_date: null as string | null },
    { name: "Lexus Car", category: "Car Purchase", bucket: null as string | null, priority: "Medium", target_amount: 45000000, current_amount: 0, target_date: "2026-11-12", status: "not_started" as const, completion_date: null as string | null },
    { name: "Buy Polo", category: "Clothing", bucket: "Lifestyle", priority: "Medium", target_amount: 5000, current_amount: 5000, target_date: "2026-07-01", status: "completed" as const, completion_date: "2026-07-09" },
  ];
  for (const row of goalRows) {
    const { data: existing } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", row.name)
      .maybeSingle();
    if (existing) {
      log.push(`Skipped goal "${row.name}" — already imported`);
      continue;
    }
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: row.name,
      category: row.category,
      bucket_id: row.bucket ? bucketId(row.bucket) : null,
      priority: row.priority,
      target_amount: row.target_amount,
      current_amount: row.current_amount,
      target_date: row.target_date,
      status: row.status,
      completion_date: row.completion_date,
    });
    log.push(error ? `Failed goal "${row.name}": ${error.message}` : `Imported goal "${row.name}"`);
  }

  return { log };
}
