import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo variant="full" />
        </Link>
        <h1 className="mt-8 text-display-md text-zinc-900">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to your financial operating system</p>

        {error === "confirmation_failed" && (
          <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            That confirmation or reset link is invalid or has expired. Please try again below.
          </p>
        )}

        <LoginForm />

        <p className="mt-8 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-brand-500">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
