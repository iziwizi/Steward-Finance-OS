import { ListChecks, Plus, Download, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { AllocationToggle } from "./allocation-toggle";
import { DeleteTransactionButton } from "./delete-button";
import { deleteIncome } from "@/lib/actions/income";
import { deleteExpense } from "@/lib/actions/expenses";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const currentTab = params.tab || "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: income }, { data: expenses }, { data: allocations }] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, txn_date, source, amount, description, accounts(name)")
      .eq("user_id", user?.id)
      .order("txn_date", { ascending: false })
      .limit(50),
    supabase
      .from("expense_transactions")
      .select("id, txn_date, reason, vendor, amount, receipt_status, budget_buckets(name), description")
      .eq("user_id", user?.id)
      .order("txn_date", { ascending: false })
      .limit(50),
    supabase
      .from("allocations")
      .select("id, planned_amount, status, budget_buckets(name), income_transaction_id")
      .eq("user_id", user?.id),
  ]);

  const allocationsByIncome = new Map<string, typeof allocations>();
  for (const a of allocations ?? []) {
    const list = allocationsByIncome.get(a.income_transaction_id) ?? [];
    list.push(a);
    allocationsByIncome.set(a.income_transaction_id, list);
  }

  // Combine into unified table format
  const allRows = [
    ...(income ?? []).map((t) => ({
      id: t.id,
      type: "income" as const,
      date: t.txn_date,
      formattedDate: new Date(t.txn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      description: t.description || t.source || "Income",
      category: "Income",
      account: (t.accounts as { name?: string } | null)?.name || "Main Account",
      status: "Cleared",
      amount: Number(t.amount),
      allocations: allocationsByIncome.get(t.id) ?? [],
      deleteAction: deleteIncome.bind(null, t.id),
    })),
    ...(expenses ?? []).map((e: any) => ({
      id: e.id,
      type: "expense" as const,
      date: e.txn_date,
      formattedDate: new Date(e.txn_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      description: e.description || e.vendor || e.reason || "Expense",
      category: e.budget_buckets?.name ?? "General",
      account: "Pocket Wallet",
      status: e.receipt_status === "verified" ? "Cleared" : "Pending",
      amount: Number(e.amount),
      allocations: [],
      deleteAction: deleteExpense.bind(null, e.id),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredRows =
    currentTab === "income"
      ? allRows.filter((r) => r.type === "income")
      : currentTab === "expenses"
      ? allRows.filter((r) => r.type === "expense")
      : currentTab === "allocations"
      ? allRows.filter((r) => r.allocations.length > 0)
      : allRows;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Transactions</h1>
          <p className="text-xs text-zinc-500">
            View and track all your income, expenses, and allocations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/api/export"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            Export CSV
          </Link>
          <Link
            href="/add"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm">
        {/* Filter Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All Transactions" },
              { id: "income", label: "Income" },
              { id: "expenses", label: "Expenses" },
              { id: "allocations", label: "Allocations" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`/transactions?tab=${tab.id}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  currentTab === tab.id
                    ? "bg-brand-50 text-brand-600 shadow-xs"
                    : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-800"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">
              {filteredRows.length} total records
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-zinc-400">
                    <EmptyState
                      icon={ListChecks}
                      title="No transactions found"
                      description="Record your first income or expense transaction to see it here."
                      actionLabel="Add Transaction"
                      actionHref="/add"
                    />
                  </td>
                </tr>
              ) : (
                filteredRows.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-zinc-50/70">
                    <td className="py-3.5 px-4 font-medium text-zinc-500">{tx.formattedDate}</td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      <div>
                        {tx.description}
                        {tx.allocations.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {tx.allocations.map((a: any) => (
                              <div
                                key={a.id}
                                className="flex items-center gap-2 text-[11px] font-normal text-zinc-500"
                              >
                                <span className="text-zinc-600 font-medium">
                                  {a.budget_buckets?.name}:
                                </span>
                                <span>{formatNaira(Number(a.planned_amount))}</span>
                                <AllocationToggle id={a.id} status={a.status} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">{tx.category}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{tx.account}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          tx.status === "Cleared"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tx.status === "Cleared" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        tx.type === "income" ? "text-emerald-600" : "text-zinc-900"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatNaira(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <DeleteTransactionButton onDelete={tx.deleteAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
