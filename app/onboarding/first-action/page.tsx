import { ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { ProgressHeader } from "../progress-header";
import { completeOnboarding } from "@/lib/actions/onboarding";

export default function OnboardingFirstActionPage() {
  return (
    <main className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <ProgressHeader step={5} back="/onboarding/accounts" />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Ready for Your First Transaction
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Your envelopes and accounts are configured. Would you like to log an opening income deposit or an expense outflow now?
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form action={completeOnboarding} className="h-full">
              <input type="hidden" name="next" value="/income/new" />
              <button
                type="submit"
                className="flex h-full w-full flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-left transition-all hover:bg-emerald-50 hover:shadow-xs active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ArrowDownLeft className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Record First Income</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Pool external funds and see them split cleanly across your envelopes.
                    </p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  Log Income <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </form>

            <form action={completeOnboarding} className="h-full">
              <input type="hidden" name="next" value="/expenses/new" />
              <button
                type="submit"
                className="flex h-full w-full flex-col justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-5 text-left transition-all hover:bg-rose-50 hover:shadow-xs active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Record First Expense</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Log a recent purchase and deduct from your designated envelope.
                    </p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                  Log Expense <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 text-center">
            <form action={completeOnboarding}>
              <input type="hidden" name="next" value="/onboarding/complete" />
              <button
                type="submit"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Skip transaction for now and enter Dashboard →
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
