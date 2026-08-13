import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
        <h1 className="mt-6 text-display-md text-zinc-900">Reset password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your email address and we&apos;ll send you instructions to reset your password
          safely.
        </p>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
