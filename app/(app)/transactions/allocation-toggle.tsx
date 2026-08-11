"use client";

import { useState, useTransition } from "react";
import { setAllocationStatus } from "@/lib/actions/expenses";

export function AllocationToggle({ id, status }: { id: string; status: "pending" | "sent" }) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = current === "sent" ? "pending" : "sent";
    setCurrent(next); // optimistic
    startTransition(async () => {
      const result = await setAllocationStatus(id, next);
      if (result?.error) setCurrent(current); // revert on failure
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`tap-target rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        current === "sent" ? "bg-accent text-white" : "bg-gold/15 text-gold"
      }`}
    >
      {current === "sent" ? "Sent" : "Pending"}
    </button>
  );
}
