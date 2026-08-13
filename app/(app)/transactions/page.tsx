import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { AllocationToggle } from "./allocation-toggle";
import { DeleteTransactionButton } from "./delete-button";
import { deleteIncome } from "@/lib/actions/income";
import { deleteExpense } from "@/lib/actions/expenses";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: income }, { data: expenses }, { data: allocations }] = await Promise.all([
    supabase
      .from("income_transactions")
      .select("id, txn_date, source, amount, description")
      .eq("user_id", user!.id)
      .order("txn_date", { ascending: false })
      .limit(30),
    supabase
      .from("expense_transactions")
      .select("id, txn_date, reason, vendor, amount, receipt_status, budget_buckets(name)")
      .eq("user_id", user!.id)
      .order("txn_date", { ascending: false })
      .limit(30),
    supabase
      .from("allocations")
      .select("id, planned_amount, status, budget_buckets(name), income_transaction_id")
      .eq("user_id", user!.id),
  ]);

  const allocationsByIncome = new Map<string, typeof allocations>();
  for (const a of allocations ?? []) {
    const list = allocationsByIncome.get(a.income_transaction_id) ?? [];
    list.push(a);
    allocationsByIncome.set(a.income_transaction_id, list);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <section>
        <h2 className="text-sm font-semibold text-ink/70">Income</h2>
        <div className="mt-2 space-y-3">
          {(income ?? []).map((t) => (
            <div key={t.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{t.source}</p>
                  <p className="text-xs text-ink/50">{t.txn_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-accent">{formatNaira(Number(t.amount))}</p>
                  <DeleteTransactionButton onDelete={deleteIncome.bind(null, t.id)} />
                </div>
              </div>
              <div className="mt-3 space-y-2 border-t border-ink/5 pt-3">
                {(allocationsByIncome.get(t.id) ?? []).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span>{a.budget_buckets?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink/60">
                        {formatNaira(Number(a.planned_amount))}
                      </span>
                      <AllocationToggle id={a.id} status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(income ?? []).length === 0 && (
            <EmptyState
              icon={ListChecks}
              title="No transactions yet"
              description="Record your first income transaction to start monitoring your StewardOS cash flow."
              actionLabel="Add Income"
              actionHref="/income/new"
            />
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink/70">Expenses</h2>
        <div className="mt-2 space-y-2">
          {(expenses ?? []).map((e: any) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div>
                <p className="font-medium">{e.reason || e.vendor || "Expense"}</p>
                <p className="text-xs text-ink/50">
                  {e.txn_date} · {e.budget_buckets?.name ?? "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-danger">{formatNaira(Number(e.amount))}</p>
                <DeleteTransactionButton onDelete={deleteExpense.bind(null, e.id)} />
              </div>
            </div>
          ))}
          {(expenses ?? []).length === 0 && (
            <EmptyState
              icon={ListChecks}
              title="No transactions yet"
              description="Record your first expense transaction to start monitoring your StewardOS cash flow."
              actionLabel="Add Expense"
              actionHref="/expenses/new"
            />
          )}
        </div>
      </section>
    </div>
  );
}
