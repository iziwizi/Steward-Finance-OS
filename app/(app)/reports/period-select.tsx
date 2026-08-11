"use client";

import type { PeriodPreset } from "@/lib/finance/allocation-engine";

const PERIODS: { value: PeriodPreset; label: string }[] = [
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "all_time", label: "All Time" },
];

export function PeriodSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="get" className="flex">
      <select
        name="period"
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4 text-sm"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </form>
  );
}
