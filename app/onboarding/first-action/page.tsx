import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { ProgressHeader } from "../progress-header";
import { completeOnboarding } from "@/lib/actions/onboarding";

export default function OnboardingFirstActionPage() {
  return (
    <main className="min-h-dvh bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <ProgressHeader step={5} back="/onboarding/accounts" />
        <h1 className="mt-8 text-display-md text-zinc-900">What&apos;s happening today?</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Take your first operational choice on StewardOS now.
        </p>

        <div className="mt-8 space-y-3">
          <form action={completeOnboarding}>
            <input type="hidden" name="next" value="/income/new" />
            <button
              type="submit"
              className="tap-target flex w-full items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <ArrowDownLeft className="h-4.5 w-4.5 text-income" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Add Income</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Receive external money first, then distribute it cleanly across your allocations.
                </p>
              </div>
            </button>
          </form>
          <form action={completeOnboarding}>
            <input type="hidden" name="next" value="/expenses/new" />
            <button
              type="submit"
              className="tap-target flex w-full items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <ArrowUpRight className="h-4.5 w-4.5 text-expense" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Add Expense</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Log an expense now to see how your balance responds across your buckets.
                </p>
              </div>
            </button>
          </form>
        </div>

        <form action={completeOnboarding} className="mt-6">
          <input type="hidden" name="next" value="/onboarding/complete" />
          <button type="submit" className="tap-target w-full text-center text-sm font-medium text-zinc-500">
            Skip for now
          </button>
        </form>
      </div>
    </main>
  );
}
