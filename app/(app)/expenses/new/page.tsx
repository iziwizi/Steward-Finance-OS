import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ArrowUpRight, Landmark, Tag, Calendar, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: buckets }, { data: expenseHistory }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", user!.id)
      .order("name"),
    supabase
      .from("budget_buckets")
      .select("id, name")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("expense_transactions")
      .select("id, txn_date, reason, vendor, amount, description, receipt_status, bucket_id, budget_buckets(name), payment_account_id, accounts:payment_account_id(name, institution)")
      .eq("user_id", user!.id)
      .order("txn_date", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Log Expense" fallbackHref="/dashboard" />

      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Log Expense</h1>
        <p className="text-xs text-zinc-500">
          Record your daily disbursements and assign outflows to their respective budget envelopes.
        </p>
      </div>

      {/* Log Expense Form Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs">
        <ExpenseForm accounts={accounts ?? []} buckets={buckets ?? []} />
      </div>

      {/* Expense History Section */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-rose-600" />
              <span>Expense History</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Recent expenditure records and assigned budget envelopes.
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Full Ledger →
          </Link>
        </div>

        {(!expenseHistory || expenseHistory.length === 0) ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            <Calendar className="mx-auto h-6 w-6 text-zinc-300 mb-1.5" />
            <p className="font-semibold text-zinc-600">No expense history recorded yet</p>
            <p className="mt-0.5">Use the form above to log your first expense transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {expenseHistory.map((exp: any) => {
              const accountObj = exp.accounts as { name?: string; institution?: string | null } | null;
              const accountName = accountObj?.name
                ? `${accountObj.name}${accountObj.institution ? ` (${accountObj.institution})` : ""}`
                : "Pocket Wallet";
              const bucketName = (exp.budget_buckets as { name?: string } | null)?.name ?? "General";

              return (
                <div key={exp.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 truncate">
                        {exp.vendor || exp.reason || "Expense Outflow"}
                      </span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-700">
                        {bucketName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(exp.txn_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Landmark className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{accountName}</span>
                      {exp.reason && exp.vendor && exp.reason !== exp.vendor && (
                        <>
                          <span className="text-zinc-300">·</span>
                          <span className="truncate text-zinc-500">{exp.reason}</span>
                        </>
                      )}
                      {exp.description && (
                        <>
                          <span className="text-zinc-300">·</span>
                          <span className="truncate text-zinc-400 italic">{exp.description}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-rose-600 text-sm">
                      -{formatNaira(Number(exp.amount))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
