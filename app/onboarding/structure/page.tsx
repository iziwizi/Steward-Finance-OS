import Link from "next/link";
import { ArrowDownLeft, SplitSquareVertical, Wallet, ArrowRight } from "lucide-react";
import { ProgressHeader } from "../progress-header";

const STEPS = [
  {
    icon: ArrowDownLeft,
    title: "1. Income enters the Pool",
    body: "Salary, payouts, dividends or gifts are pooled into your available balance first before any spending occurs.",
  },
  {
    icon: SplitSquareVertical,
    title: "2. Automatic Purpose Allocations",
    body: "Your defined allocation percentages instantly divide every incoming naira into purpose-driven budget buckets.",
  },
  {
    icon: Wallet,
    title: "3. Disburse & Spend with Peace",
    body: "Track actual expenses against specific envelopes. You always know exactly what is safe to spend.",
  },
];

export default function OnboardingStructurePage() {
  return (
    <main className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <ProgressHeader step={2} back="/onboarding/personal" />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              The StewardOS Operating Rhythm
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Here is how our envelope allocation matrix ensures total clarity over every naira.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-5 transition-all hover:bg-zinc-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900">{title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100">
            <Link
              href="/onboarding/allocations"
              className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              <span>Configure Your Allocations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
