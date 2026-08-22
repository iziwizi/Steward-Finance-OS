import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAccount } from "@/lib/actions/accounts";
import { ProgressHeader } from "../progress-header";
import { Landmark, Plus, ArrowRight, ShieldCheck, Wallet } from "lucide-react";

export default async function OnboardingAccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, institution")
    .eq("user_id", user.id)
    .order("name");

  return (
    <main className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <ProgressHeader step={4} back="/onboarding/allocations" />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Connect Your Accounts &amp; Wallets
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Add the bank accounts, mobile money wallets, or savings apps you use to receive income and fund envelope allocations.
            </p>
          </div>

          {/* Account List / Empty State */}
          <div className="mt-8 space-y-4">
            {(!accounts || accounts.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center space-y-2">
                <Wallet className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="text-xs sm:text-sm font-bold text-zinc-800">No Accounts Added Yet</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Add at least one bank account, cash wallet, or mobile money account below.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Configured Accounts ({accounts.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {accounts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-zinc-900">{a.name}</p>
                        <p className="truncate text-[10px] text-zinc-400">
                          {a.institution || "Personal Account"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Account Form */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 mt-6 space-y-3">
              <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-brand-600" />
                <span>Add An Account</span>
              </p>

              <form
                action={async (formData) => {
                  "use server";
                  await createAccount(formData);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="name"
                    placeholder="Account Name (e.g. Salary Bank, Cash)"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    name="institution"
                    placeholder="Bank / Provider (Optional e.g. GTBank, Kuda)"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 active:scale-95 transition-all"
                  >
                    + Add Account
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <Link
              href="/onboarding/first-action"
              className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
