"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "navigation" | "transaction" | "goal" | "bill" | "subscription" | "asset" | "journal";
  amount?: number;
}

const STATIC_NAVIGATION: Array<{
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}> = [
  {
    title: "Overview",
    subtitle: "Dashboard & Key Financial Metrics",
    href: "/dashboard",
    keywords: ["overview", "dashboard", "home", "cash flow", "surplus", "metrics", "summary"],
  },
  {
    title: "Transactions",
    subtitle: "Income, Expenses & Ledger History",
    href: "/transactions",
    keywords: ["transactions", "income", "expenses", "ledger", "spending", "history"],
  },
  {
    title: "Goals",
    subtitle: "Savings & Milestone Targets",
    href: "/goals",
    keywords: ["goals", "savings", "targets", "emergency fund", "milestones", "freedom fund"],
  },
  {
    title: "Allocation Center",
    subtitle: "Envelope Split Rules & Distribution",
    href: "/allocations",
    keywords: ["allocations", "allocation center", "buckets", "envelopes", "split", "tithe", "rules"],
  },
  {
    title: "Reports & Analytics",
    subtitle: "Cash Flow Trends & Category Breakdown",
    href: "/reports",
    keywords: ["reports", "analytics", "trends", "charts", "spending by category", "export"],
  },
  {
    title: "Monthly Review",
    subtitle: "Monthly Financial Audit & Performance",
    href: "/monthly-review",
    keywords: ["monthly review", "review", "audit", "month end", "performance"],
  },
  {
    title: "Upcoming Bills",
    subtitle: "Recurring Obligations & Due Dates",
    href: "/bills",
    keywords: ["bills", "obligations", "due dates", "utilities", "rent"],
  },
  {
    title: "Subscriptions",
    subtitle: "Recurring Memberships & Active Services",
    href: "/subscriptions",
    keywords: ["subscriptions", "recurring", "memberships", "netflix", "cloud", "services"],
  },
  {
    title: "Assets & Holdings",
    subtitle: "Physical, Digital & Financial Assets",
    href: "/assets",
    keywords: ["assets", "holdings", "property", "net worth", "vehicles", "investments"],
  },
  {
    title: "Wishlist",
    subtitle: "Planned Desires & Future Purchases",
    href: "/wishlist",
    keywords: ["wishlist", "wishes", "planned purchases", "desires"],
  },
  {
    title: "Insights & Celebrations",
    subtitle: "Milestone Badges & Positive Cash Flow",
    href: "/celebrations",
    keywords: ["insights", "celebrations", "badges", "milestones", "streaks"],
  },
  {
    title: "Financial Journal",
    subtitle: "Reflections & Decisions Diary",
    href: "/journal",
    keywords: ["journal", "reflections", "diary", "gratitude", "notes"],
  },
  {
    title: "Profile & Settings",
    subtitle: "Personal Information, Currency & Rules",
    href: "/settings?tab=profile",
    keywords: ["settings", "profile", "avatar", "currency", "timezone", "security", "danger zone"],
  },
];

export async function searchWorkspace(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 1) return [];

  const rawQ = query.trim().toLowerCase();
  const cleanQ = `%${rawQ}%`;
  const results: SearchResultItem[] = [];

  // 1. Match Navigation Items
  STATIC_NAVIGATION.forEach((nav) => {
    if (
      nav.title.toLowerCase().includes(rawQ) ||
      nav.subtitle.toLowerCase().includes(rawQ) ||
      nav.keywords.some((k) => k.includes(rawQ) || rawQ.includes(k))
    ) {
      results.push({
        id: `nav-${nav.href}`,
        title: nav.title,
        subtitle: nav.subtitle,
        href: nav.href,
        category: "navigation",
      });
    }
  });

  if (rawQ.length < 2) return results;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return results;

  const [
    { data: income },
    { data: expenses },
    { data: goals },
    { data: bills },
    { data: subscriptions },
    { data: assets },
    { data: journal },
  ] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, source, description, amount, txn_date")
      .eq("user_id", user.id)
      .or(`source.ilike.${cleanQ},description.ilike.${cleanQ}`)
      .limit(4),
    supabase
      .from("expense_transactions")
      .select("id, vendor, reason, description, amount, txn_date")
      .eq("user_id", user.id)
      .or(`vendor.ilike.${cleanQ},reason.ilike.${cleanQ},description.ilike.${cleanQ}`)
      .limit(4),
    supabase
      .from("goals")
      .select("id, name, target_amount, current_amount")
      .eq("user_id", user.id)
      .ilike("name", cleanQ)
      .limit(4),
    supabase
      .from("bills")
      .select("id, name, amount, next_due")
      .eq("user_id", user.id)
      .ilike("name", cleanQ)
      .limit(4),
    supabase
      .from("subscriptions")
      .select("id, service_name, cost, billing_cycle")
      .eq("user_id", user.id)
      .ilike("service_name", cleanQ)
      .limit(4),
    supabase
      .from("assets")
      .select("id, name, estimated_value, category")
      .eq("user_id", user.id)
      .ilike("name", cleanQ)
      .limit(4),
    supabase
      .from("financial_journal_entries")
      .select("id, entry_date, did_well, grateful_for")
      .eq("user_id", user.id)
      .or(`did_well.ilike.${cleanQ},grateful_for.ilike.${cleanQ}`)
      .limit(4),
  ]);

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

  (assets ?? []).forEach((a) => {
    results.push({
      id: `asset-${a.id}`,
      title: a.name,
      subtitle: `Asset · ${a.category || "General"}`,
      href: "/assets",
      category: "asset",
      amount: Number(a.estimated_value),
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
