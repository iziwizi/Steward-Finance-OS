"use client";

import { useActionState } from "react";
import { resendConfirmation } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-state";

export function ResendConfirmation({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendConfirmation, initialAuthState);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="email" value={email} />
      {state.success ? (
        <p role="status" className="text-sm text-income">
          {state.success}
        </p>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="text-sm font-medium text-brand-500 underline disabled:opacity-60"
        >
          {pending ? "Resending…" : "Didn't get it? Resend confirmation email"}
        </button>
      )}
      {state.error && <p className="mt-1 text-sm text-expense">{state.error}</p>}
    </form>
  );
}
