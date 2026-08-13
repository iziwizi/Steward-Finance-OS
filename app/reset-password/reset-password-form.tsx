"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { updatePassword } from "@/lib/actions/password-reset";
import { initialAuthState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialAuthState);

  if (state.success) {
    return (
      <div className="mt-16 flex flex-col items-center text-center animate-fade-in-up">
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-emerald-50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={2} />
          </div>
        </div>
        <h1 className="mt-8 text-display-md text-zinc-900">Password updated</h1>
        <p className="mt-3 max-w-xs text-sm text-zinc-500">
          Your password has been changed successfully. You can now use your new credentials to
          sign in.
        </p>
        <Link
          href="/dashboard"
          className="tap-target mt-8 flex w-full max-w-xs items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
        >
          Continue to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5 animate-fade-in-up">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Input
        id="password"
        name="password"
        type="password"
        label="New Password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm New Password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
