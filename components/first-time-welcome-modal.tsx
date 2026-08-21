"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sliders, ArrowDownLeft, PieChart, Target, ArrowRight, X, Sparkles } from "lucide-react";

export function FirstTimeWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the welcome modal
    const hasSeen = localStorage.getItem("stewardos_welcome_seen_v1");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("stewardos_welcome_seen_v1", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
      <div className="w-full max-w-lg max-h-[90dvh] flex flex-col rounded-2xl bg-white p-5 sm:p-6 md:p-7 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-fast">
        {/* Header (fixed) */}
        <div className="flex items-start justify-between shrink-0 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 truncate">Welcome to StewardOS</h2>
              <p className="text-xs text-zinc-500 truncate">
                Your financial operating system is ready.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Concise Steps (Scrollable Content Area) */}
        <div className="overflow-y-auto min-h-0 py-4 space-y-3 flex-1 pr-1">
          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 sm:p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
              1
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900">Set your allocation percentages</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Define the percentage split rules for tithe, living expenses, investments, and freedom funds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 sm:p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
              2
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900">Record your first income</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Log salary or revenue inflows; StewardOS automatically calculates the exact split.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 sm:p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
              3
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900">Review your allocations</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                See planned amounts for each envelope, then mark them as Sent when transferred.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 sm:p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
              4
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-900">Start tracking your financial goals</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Fund milestones, vehicle savings, and freedom targets with visual progress bars.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (fixed footer) */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-zinc-100 shrink-0">
          <Link
            href="/settings?tab=instructions"
            onClick={handleDismiss}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 sm:py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all"
          >
            <span>View Getting Started Guide</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
