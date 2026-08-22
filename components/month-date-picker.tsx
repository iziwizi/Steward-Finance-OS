"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface MonthDatePickerProps {
  currentMonth: string; // e.g. "2026-08"
  baseUrl: string; // e.g. "/reports" or "/monthly-review"
  prevMonthKey: string;
  nextMonthKey: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function MonthDatePicker({
  currentMonth,
  baseUrl,
  prevMonthKey,
  nextMonthKey,
}: MonthDatePickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [yearStr, monthNumStr] = currentMonth.split("-");
  const parsedYear = parseInt(yearStr, 10) || new Date().getFullYear();
  const parsedMonth = (parseInt(monthNumStr, 10) || new Date().getMonth() + 1) - 1;

  const [viewYear, setViewYear] = useState(parsedYear);
  const [viewMode, setViewMode] = useState<"months" | "days">("months");

  // Keep viewYear in sync when currentMonth prop changes
  useEffect(() => {
    setViewYear(parsedYear);
  }, [parsedYear]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const monthDisplayName = new Date(parsedYear, parsedMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleSelectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const targetKey = `${viewYear}-${mm}`;
    setIsOpen(false);
    router.push(`${baseUrl}?month=${targetKey}`);
  };

  const handleSelectDay = (day: number) => {
    const mm = String(parsedMonth + 1).padStart(2, "0");
    const targetKey = `${viewYear}-${mm}`;
    setIsOpen(false);
    router.push(`${baseUrl}?month=${targetKey}`);
  };

  // Calendar Day Generation
  const daysInMonth = new Date(viewYear, parsedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, parsedMonth, 1).getDay();

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={popoverRef}>
      {/* Previous Month Arrow */}
      <Link
        href={`${baseUrl}?month=${prevMonthKey}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-xs transition-colors hover:bg-zinc-50 active:scale-95"
        title="Previous Month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* Interactive Center Month Indicator & Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-xs transition-all hover:border-brand-500 hover:bg-zinc-50 active:scale-95 focus:outline-none"
      >
        <Calendar className="h-3.5 w-3.5 text-brand-600" />
        <span>{monthDisplayName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Next Month Arrow */}
      <Link
        href={`${baseUrl}?month=${nextMonthKey}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-xs transition-colors hover:bg-zinc-50 active:scale-95"
        title="Next Month"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>

      {/* Popover Calendar / Month Selector */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-1.5 w-72 max-w-[calc(100vw-32px)] rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-fast">
          {/* Header with Year Switcher & Mode Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-bold text-zinc-900">{viewYear}</span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="my-2.5 flex items-center rounded-lg bg-zinc-100 p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("months")}
              className={`flex-1 rounded-md py-1 transition-colors ${
                viewMode === "months" ? "bg-white text-brand-600 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Select Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("days")}
              className={`flex-1 rounded-md py-1 transition-colors ${
                viewMode === "days" ? "bg-white text-brand-600 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Calendar Date
            </button>
          </div>

          {/* View 1: 12-Month Grid */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {SHORT_MONTHS.map((m, idx) => {
                const isSelected = viewYear === parsedYear && idx === parsedMonth;
                const isCurrentMonthThisYear =
                  viewYear === new Date().getFullYear() && idx === new Date().getMonth();

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMonth(idx)}
                    className={`rounded-xl py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-brand-500 font-bold text-white shadow-xs"
                        : isCurrentMonthThisYear
                        ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* View 2: Days of Month Calendar Grid */}
          {viewMode === "days" && (
            <div className="pt-1">
              <p className="mb-2 text-center text-[11px] font-bold text-zinc-600">
                {MONTH_NAMES[parsedMonth]} {viewYear}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-zinc-400">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium text-zinc-700 hover:bg-brand-50 hover:text-brand-700 transition-colors mx-auto"
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Quick Action */}
          <div className="mt-3 border-t border-zinc-100 pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                setIsOpen(false);
                router.push(`${baseUrl}?month=${nowKey}`);
              }}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
            >
              Current Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
