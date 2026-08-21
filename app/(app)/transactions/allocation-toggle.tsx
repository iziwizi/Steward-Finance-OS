"use client";

import { useState, useTransition } from "react";
import { setAllocationStatus } from "@/lib/actions/expenses";
import { Loader2 } from "lucide-react";

export function AllocationToggle({ id, status }: { id: string; status: "pending" | "sent" }) {
  const [current, setCurrent] = useState<"pending" | "sent">(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as "pending" | "sent";
    const prev = current;
    setCurrent(next); // optimistic update

    startTransition(async () => {
      try {
        const result = await setAllocationStatus(id, next);
        if (result?.error) {
          setCurrent(prev); // rollback on error
        }
      } catch {
        setCurrent(prev);
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={handleChange}
        disabled={isPending}
        className={`tap-target appearance-none rounded-lg border py-1 pl-2.5 pr-6 text-[11px] font-bold transition-all focus:outline-none focus:ring-1 ${
          current === "sent"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 focus:ring-emerald-500"
            : "border-amber-200 bg-amber-50 text-amber-800 focus:ring-amber-500"
        } ${isPending ? "opacity-60" : ""}`}
      >
        <option value="pending">Pending</option>
        <option value="sent">Sent</option>
      </select>
      <div className="pointer-events-none absolute right-1.5 flex items-center">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
        ) : (
          <svg className="h-3 w-3 text-zinc-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
