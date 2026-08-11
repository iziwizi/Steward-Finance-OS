import Link from "next/link";
import { SignupForm } from "./signup-form";

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

        <SignupForm />

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
