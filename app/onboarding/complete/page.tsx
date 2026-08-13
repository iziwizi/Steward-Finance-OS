import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function OnboardingCompletePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-10 text-center animate-fade-in-up">
      <Logo />
      <div className="mt-10 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-emerald-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" strokeWidth={2} />
        </div>
      </div>
      <h1 className="mt-8 max-w-xs text-display-md text-zinc-900">
        Your financial operating system is ready.
      </h1>
      <p className="mt-3 max-w-xs text-sm text-zinc-500">
        You&apos;re set to start tracking, allocating, and growing. Welcome to intentional
        stewardship.
      </p>
      <Link
        href="/dashboard"
        className="tap-target mt-10 flex w-full max-w-xs items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
      >
        Enter StewardOS
      </Link>
    </main>
  );
}
