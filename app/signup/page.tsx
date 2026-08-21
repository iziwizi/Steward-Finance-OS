import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo variant="full" />
        </Link>
        <h1 className="mt-8 text-display-md text-zinc-900">Start your journey</h1>
        <p className="mt-1 text-sm text-zinc-500">Create your steward account in seconds</p>

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
