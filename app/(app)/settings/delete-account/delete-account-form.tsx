"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteAccount } from "@/lib/actions/account";
import { initialAuthState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialAuthState);
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation === "DELETE";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="confirmation" className="text-sm font-medium text-zinc-900">
          Type <span className="font-bold text-red-700">DELETE</span> to confirm
        </label>
        <input
          id="confirmation"
          name="confirmation"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          className="tap-target w-full rounded-md border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
        />
      </div>

      <div className="space-y-3">
        <Button type="submit" variant="danger" disabled={!canDelete || pending} className="w-full">
          {pending ? "Deleting…" : "Delete My Account"}
        </Button>
        <Link
          href="/settings"
          className="tap-target flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white text-sm font-semibold text-zinc-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
