"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { initialAuthState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialAuthState);

  if (state.success) {
    return (
      <p role="status" className="mt-8 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-fade-in-up">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5 animate-fade-in-up">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Input id="email" name="email" type="email" label="Email Address" required autoComplete="email" />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send Reset Link"}
      </Button>
    </form>
  );
}
