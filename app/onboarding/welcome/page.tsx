import Link from "next/link";
import { Logo } from "@/components/logo";
import { TreePine } from "lucide-react";

export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-dvh flex-col justify-between bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Logo />
        <div className="mt-16">
          <h1 className="text-display-lg text-zinc-900">Steward your money with intention.</h1>
          <p className="mt-6 text-sm leading-6 text-zinc-500">
            StewardOS helps you understand where your money goes, allocate with purpose, and
            build better financial habits.
          </p>
        </div>
        <div className="mt-16 flex flex-col items-center gap-4 text-center text-zinc-300">
          <TreePine className="h-16 w-16" strokeWidth={1} />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Path to Financial Mastery
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-4">
        <Link
          href="/onboarding/personal"
          className="tap-target flex w-full items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
        >
          Get Started
        </Link>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-500">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
