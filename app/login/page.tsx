import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">Log in to StewardOS.</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-ink/60">
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
