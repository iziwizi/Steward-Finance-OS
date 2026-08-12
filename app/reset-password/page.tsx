import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-1 text-sm text-ink/60">
          You're signed in via your reset link — set a new password to finish.
        </p>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
