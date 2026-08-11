import Link from "next/link";
import { logIn } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">Log in to StewardOS.</p>

        <form action={logIn} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink/80">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="tap-target mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 text-base"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink/80">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="tap-target mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 text-base"
            />
          </div>
          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-accent font-medium text-white"
          >
            Log in
          </button>
        </form>

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
