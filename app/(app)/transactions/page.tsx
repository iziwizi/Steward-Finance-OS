import { createClient } from "@/lib/supabase/server";
import { TransactionsView, type TransactionRow } from "./transactions-view";
import { deleteIncome } from "@/lib/actions/income";
import { deleteExpense } from "@/lib/actions/expenses";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: income },
    { data: expenses },
    { data: allocations },
    { data: buckets },
    { data: accounts },
  ] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, txn_date, source, amount, description, account_id, accounts(name)")
      .eq("user_id", user?.id)
      .order("txn_date", { ascending: false })
      .limit(200),
    supabase
      .from("expense_transactions")
      .select("id, txn_date, reason, vendor, amount, receipt_status, bucket_id, budget_buckets(name), description")
      .eq("user_id", user?.id)
      .order("txn_date", { ascending: false })
      .limit(200),
    supabase
      .from("allocations")
      .select("id, planned_amount, status, budget_buckets(name), income_transaction_id")
      .eq("user_id", user?.id),
    supabase
      .from("budget_buckets")
      .select("id, name")
      .eq("user_id", user?.id)
      .order("sort_order"),
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", user?.id)
      .order("name"),
  ]);

  const allocationsByIncome = new Map<string, any[]>();
  for (const a of allocations ?? []) {
    const list = allocationsByIncome.get(a.income_transaction_id) ?? [];
    list.push(a);
    allocationsByIncome.set(a.income_transaction_id, list);
  }

  const rows: TransactionRow[] = [
    ...(income ?? []).map((t) => ({
      id: t.id,
      type: "income" as const,
      date: t.txn_date,
      formattedDate: new Date(t.txn_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      description: t.description || t.source || "Salary / Payout",
      category: "Income",
      account: (t.accounts as { name?: string } | null)?.name || "Main Account",
      accountId: t.account_id || undefined,
      status: "Cleared" as const,
      amount: Number(t.amount),
      allocations: allocationsByIncome.get(t.id) ?? [],
      deleteAction: deleteIncome.bind(null, t.id),
    })),
    ...(expenses ?? []).map((e: any) => ({
      id: e.id,
      type: "expense" as const,
      date: e.txn_date,
      formattedDate: new Date(e.txn_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      description: e.description || e.vendor || e.reason || "Expense Outflow",
      category: e.budget_buckets?.name ?? "General",
      categoryId: e.bucket_id || undefined,
      account: "Pocket Wallet",
      status: (e.receipt_status === "verified" ? "Cleared" : "Pending") as "Cleared" | "Pending",
      amount: Number(e.amount),
      allocations: [],
      deleteAction: deleteExpense.bind(null, e.id),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-12">
      <TransactionsView
        rows={rows}
        buckets={buckets ?? []}
        accounts={accounts ?? []}
      />
    </div>
  );
}
