import Link from "next/link";
import { ArrowDownLeft, SplitSquareVertical, Wallet } from "lucide-react";
import { ProgressHeader } from "../progress-header";

const STEPS = [
  {
    icon: ArrowDownLeft,
    title: "Income comes in",
    body: "Salary, payouts, dividends or gifts are pooled into your main available balance.",
  },
  {
    icon: SplitSquareVertical,
    title: "Allocate to purpose-driven buckets",
    body: "Decide instantly how your income is divided before you spend any of it.",
  },
  {
    icon: Wallet,
    title: "Spend & track with clarity",
    body: "Rest easy knowing every naira you spend belongs to its defined purpose.",
  },
];

export default function OnboardingStructurePage() {
  return (
    <main className="min-h-dvh bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <ProgressHeader step={2} back="/onboarding/personal" />
        <h1 className="mt-8 text-display-md text-zinc-900">How StewardOS works</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Our unique allocation system ensures every naira has a specific job.
        </p>

        <div className="mt-8 space-y-6">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500">
                {i + 1}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                  <Icon className="h-4 w-4 text-brand-500" strokeWidth={1.75} />
                  {title}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/onboarding/allocations"
          className="tap-target mt-10 flex w-full items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
