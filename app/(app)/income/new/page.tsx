import { createClient } from "@/lib/supabase/server";
import { IncomeForm } from "./income-form";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { ArrowDownLeft, Landmark, CheckCircle2, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export default async function NewIncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: incomeHistory }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", user!.id)
      .order("name"),
    supabase
      .from("income_transactions")
      .select("id, txn_date, source, amount, description, account_id, accounts(name, institution), allocations(id, status, planned_amount)")
      .eq("user_id", user!.id)
      .order("txn_date", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Record Income" fallbackHref="/dashboard" />

      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Record Income</h1>
        <p className="text-xs text-zinc-500">
          Inflows are automatically split across your designated budget envelopes with integer kobo precision.
        </p>
      </div>

      {/* Record Income Form Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs">
        <IncomeForm accounts={accounts ?? []} />
      </div>

      {/* Income History Section */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              <span>Income History</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Recent income receipts and their envelope allocation status.
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Full Ledger →
          </Link>
        </div>

        {(!incomeHistory || incomeHistory.length === 0) ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            <Calendar className="mx-auto h-6 w-6 text-zinc-300 mb-1.5" />
            <p className="font-semibold text-zinc-600">No income history recorded yet</p>
            <p className="mt-0.5">Use the form above to record your first income deposit.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {incomeHistory.map((inc: any) => {
              const accountName = inc.accounts?.name
                ? `${inc.accounts.name}${inc.accounts.institution ? ` (${inc.accounts.institution})` : ""}`
                : "Main Account";
              
              const allocs = inc.allocations ?? [];
              const pendingCount = allocs.filter((a: any) => a.status === "pending").length;
              const allSent = allocs.length > 0 && pendingCount === 0;

              return (
                <div key={inc.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 truncate">
                        {inc.source || "Income Deposit"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(inc.txn_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Landmark className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{accountName}</span>
                      {inc.description && (
                        <>
                          <span className="text-zinc-300">·</span>
                          <span className="truncate text-zinc-400 italic">{inc.description}</span>
                        </>
                      )}
                    </div>

                    {allocs.length > 0 && (
                      <div className="pt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-bold ${
                            allSent
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {allSent ? (
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          ) : (
                            <Clock className="h-2.5 w-2.5" />
                          )}
                          <span>
                            {allocs.length} envelope{allocs.length === 1 ? "" : "s"} · {allSent ? "All Dispatched" : `${pendingCount} Pending`}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-600 text-sm">
                      +{formatNaira(Number(inc.amount))}
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
