import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Logo variant="full" />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        <div>
          <h1 className="text-display-md text-zinc-900">Start your journey</h1>
          <p className="mt-1 text-sm text-zinc-500">Create your steward account in seconds</p>
        </div>

        <SignupForm />

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-500">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
