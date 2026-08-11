import Link from "next/link";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">Set up StewardOS</h1>
        <p className="mt-1 text-sm text-ink/60">
          Your buckets (Tithe, Living Expenses, Future Martins, Freedom Fund, Kingdom
          Giving, Mother, Lifestyle, Miscellaneous, Rent Fund) are created automatically —
          you can edit percentages and accounts afterward.
        </p>

        <form action={signUp} className="mt-8 space-y-4">
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
              minLength={8}
              autoComplete="new-password"
              className="tap-target mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 text-base"
            />
          </div>
          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-accent font-medium text-white"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
