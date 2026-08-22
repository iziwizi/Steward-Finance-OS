import Link from "next/link";
import { Logo } from "@/components/logo";
import { Sparkles, ShieldCheck, PieChart, ArrowRight } from "lucide-react";

export default function OnboardingWelcomePage() {
  return (
    <main className="min-h-dvh bg-paper flex flex-col justify-between px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
          <Logo variant="full" />
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">
            Initial Setup
          </span>
        </div>

        <div className="mt-8 md:mt-12 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-4 text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Steward your wealth with clarity &amp; purpose.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              StewardOS helps you take intentional command over your financial rhythm. Before you disburse or spend, every incoming naira is allocated with purpose to custom envelopes.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-zinc-100">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 space-y-1">
              <div className="flex items-center gap-2 text-brand-600">
                <PieChart className="h-4 w-4" />
                <p className="text-xs font-bold text-zinc-900">Purposeful Allocations</p>
              </div>
              <p className="text-[11px] text-zinc-500">
                Custom envelopes configured by you to reflect your unique financial life.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 space-y-1">
              <div className="flex items-center gap-2 text-brand-600">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-bold text-zinc-900">Complete Data Privacy</p>
              </div>
              <p className="text-[11px] text-zinc-500">
                Multi-tenant isolation and strict row-level security guard your personal records.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl md:max-w-2xl mt-8 space-y-3">
        <Link
          href="/onboarding/personal"
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-center text-xs text-zinc-500">
          Already have an account configured?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
