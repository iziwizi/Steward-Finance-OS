"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "transaction" | "goal" | "bill" | "subscription" | "journal";
  amount?: number;
}

export async function searchWorkspace(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const cleanQ = `%${query.trim()}%`;

  const [
    { data: income },
    { data: expenses },
    { data: goals },
    { data: bills },
    { data: subscriptions },
    { data: journal },
  ] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, source, description, amount, txn_date")
      .eq("user_id", user.id)
      .or(`source.ilike.${cleanQ},description.ilike.${cleanQ}`)
      .limit(5),
    supabase
      .from("expense_transactions")
      .select("id, vendor, reason, description, amount, txn_date")
      .eq("user_id", user.id)
      .or(`vendor.ilike.${cleanQ},reason.ilike.${cleanQ},description.ilike.${cleanQ}`)
      .limit(5),
    supabase
      .from("goals")
      .select("id, name, target_amount, current_amount")
      .eq("user_id", user.id)
      .ilike("name", cleanQ)
      .limit(5),
    supabase
      .from("bills")
      .select("id, name, amount, next_due")
      .eq("user_id", user.id)
      .ilike("name", cleanQ)
      .limit(5),
    supabase
      .from("subscriptions")
      .select("id, service_name, cost, billing_cycle")
      .eq("user_id", user.id)
      .ilike("service_name", cleanQ)
      .limit(5),
    supabase
      .from("financial_journal_entries")
      .select("id, entry_date, did_well, grateful_for")
      .eq("user_id", user.id)
      .or(`did_well.ilike.${cleanQ},grateful_for.ilike.${cleanQ}`)
      .limit(5),
  ]);

  const results: SearchResultItem[] = [];

  (income ?? []).forEach((i) => {
    results.push({
      id: `inc-${i.id}`,
      title: i.source || i.description || "Income Transaction",
      subtitle: `Income · ${i.txn_date}`,
      href: "/transactions?tab=income",
      category: "transaction",
      amount: Number(i.amount),
    });
  });

  (expenses ?? []).forEach((e) => {
    results.push({
      id: `exp-${e.id}`,
      title: e.vendor || e.reason || e.description || "Expense Transaction",
      subtitle: `Expense · ${e.txn_date}`,
      href: "/transactions?tab=expenses",
      category: "transaction",
      amount: Number(e.amount),
    });
  });

  (goals ?? []).forEach((g) => {
    results.push({
      id: `goal-${g.id}`,
      title: g.name,
      subtitle: `Goal · Target ₦${Number(g.target_amount).toLocaleString()}`,
      href: "/goals",
      category: "goal",
    });
  });

  (bills ?? []).forEach((b) => {
    results.push({
      id: `bill-${b.id}`,
      title: b.name,
      subtitle: `Bill · Due ${b.next_due ?? "Soon"}`,
      href: "/bills",
      category: "bill",
      amount: Number(b.amount),
    });
  });

  (subscriptions ?? []).forEach((s) => {
    results.push({
      id: `sub-${s.id}`,
      title: s.service_name,
      subtitle: `Subscription · ${s.billing_cycle}`,
      href: "/subscriptions",
      category: "subscription",
      amount: Number(s.cost),
    });
  });

  (journal ?? []).forEach((j) => {
    results.push({
      id: `journal-${j.id}`,
      title: `Journal Reflection (${j.entry_date})`,
      subtitle: (j.did_well || j.grateful_for || "").slice(0, 50) + "...",
      href: `/journal?entry=${j.id}`,
      category: "journal",
    });
  });

  return results;
}
