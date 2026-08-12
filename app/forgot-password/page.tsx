import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink/60">
          Enter the email on your account and we'll send you a reset link.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/login" className="font-medium text-accent">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
