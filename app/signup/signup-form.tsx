"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-state";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialAuthState);

  if (state.success) {
    return (
      <p role="status" className="mt-8 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
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
        disabled={pending}
        className="tap-target w-full rounded-xl bg-accent font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
