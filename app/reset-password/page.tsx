import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-paper px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <Logo />
        <h1 className="mt-9 text-display-md text-zinc-900">Create new password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Please enter a secure password that you do not use anywhere else.
        </p>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
