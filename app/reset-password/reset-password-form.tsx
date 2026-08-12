"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/password-reset";
import { initialAuthState } from "@/lib/actions/auth-state";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialAuthState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink/80">
          New password
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
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink/80">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="tap-target mt-1 w-full rounded-xl border border-ink/15 bg-white px-4 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="tap-target w-full rounded-xl bg-accent font-medium text-white disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
