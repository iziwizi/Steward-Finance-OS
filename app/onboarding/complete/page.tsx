import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

export default function OnboardingCompletePage() {
  return (
    <main className="min-h-dvh bg-paper flex flex-col items-center justify-center px-4 py-8 sm:px-6 text-center animate-fade-in-up">
      <div className="w-full max-w-xl md:max-w-2xl rounded-3xl border border-zinc-200/80 bg-white p-8 sm:p-12 shadow-sm space-y-6">
        <div className="flex justify-center">
          <Logo variant="full" />
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-100 mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Your Personal Finance OS is Ready
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            You are set to start recording income, distributing allocations, tracking daily expenses, and building intentional stewardship.
          </p>
        </div>

        <div className="pt-4 max-w-sm mx-auto">
          <Link
            href="/dashboard"
            className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
          >
            <span>Enter StewardOS Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
