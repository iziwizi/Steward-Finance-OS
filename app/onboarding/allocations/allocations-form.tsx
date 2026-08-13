"use client";

import { useMemo, useState } from "react";
import { saveOnboardingAllocations } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

type Bucket = { id: string; name: string; target_percent: number };

export function AllocationsForm({ buckets }: { buckets: Bucket[] }) {
  const [percents, setPercents] = useState<Record<string, number>>(
    Object.fromEntries(buckets.map((b) => [b.id, Number(b.target_percent)]))
  );
  const total = useMemo(
    () => Object.values(percents).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
    [percents]
  );

  return (
    <form action={saveOnboardingAllocations} className="mt-8 space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-zinc-500">
            Total income allocated
          </span>
          <span className={`font-semibold ${total === 100 ? "text-income" : "text-amber-600"}`}>
            {total.toFixed(1)}%
          </span>
        </div>
        <ProgressBar percent={total} tone={total > 100 ? "danger" : "brand"} className="mt-2" />
      </div>

      <div className="space-y-2">
        {buckets.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2.5"
          >
            <span className="text-sm text-zinc-900">{b.name}</span>
            <input
              type="number"
              name={`percent_${b.id}`}
              step="0.1"
              min={0}
              max={100}
              value={percents[b.id]}
              onChange={(e) =>
                setPercents((prev) => ({ ...prev, [b.id]: Number(e.target.value) }))
              }
              className="tap-target w-20 rounded-md border border-zinc-200 px-2 text-right text-sm"
            />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        Save &amp; Continue
      </Button>
    </form>
  );
}
