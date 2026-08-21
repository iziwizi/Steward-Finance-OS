"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, X, Filter } from "lucide-react";

export function AllocationDateFilter({
  currentDate,
  currentFilter,
}: {
  currentDate?: string;
  currentFilter?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleQuickFilter = (filterType: "all" | "today" | "yesterday") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    params.delete("income_id");
    if (filterType === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filterType);
    }
    router.push(`/allocations?${params.toString()}`);
  };

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter");
    params.delete("income_id");
    if (newDate) {
      params.set("date", newDate);
    } else {
      params.delete("date");
    }
    router.push(`/allocations?${params.toString()}`);
  };

  const handleClear = () => {
    router.push("/allocations");
  };

  const isFiltered = Boolean(currentDate || (currentFilter && currentFilter !== "all"));

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleQuickFilter("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            !currentDate && (!currentFilter || currentFilter === "all")
              ? "bg-brand-500 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All Recent
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("today")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            currentFilter === "today"
              ? "bg-brand-500 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("yesterday")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            currentFilter === "yesterday"
              ? "bg-brand-500 text-white shadow-xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Yesterday
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="date"
            value={currentDate || ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white py-1 pl-8 pr-2.5 text-xs text-zinc-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-2xs cursor-pointer"
          />
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Clear date filter"
          >
            <X className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}