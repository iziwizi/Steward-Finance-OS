"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteTransactionButton({
  onDelete,
}: {
  onDelete: () => Promise<{ error?: string; success?: boolean } | undefined>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            startTransition(async () => {
              await onDelete();
            })
          }
          disabled={isPending}
          className="tap-target rounded-lg bg-danger px-2 py-1 text-[11px] font-medium text-white"
        >
          {isPending ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="tap-target rounded-lg border border-ink/15 px-2 py-1 text-[11px] font-medium text-ink/60"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      aria-label="Delete transaction"
      className="tap-target rounded-lg p-1.5 text-ink/30 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
