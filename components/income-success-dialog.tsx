"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ArrowUpRight, Check, X } from "lucide-react";
import { formatNaira } from "@/lib/finance/allocation-engine";

export function IncomeSuccessDialog({
  amount,
  isOpen,
  onClose,
  onRecordExpense,
}: {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onRecordExpense?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-center space-y-5 animate-in zoom-in-95 duration-fast">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-zinc-900">Income Recorded Successfully</h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
            Your <span className="font-bold text-zinc-900">{formatNaira(amount)}</span> income has been allocated according to your current allocation plan.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-left">
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            💡 <strong>Next Step:</strong> You can mark allocations as <strong>Sent</strong> from the Allocations page after you physically transfer the funds to your dedicated accounts or envelopes.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/allocations"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all"
          >
            <span>Review Allocations</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {onRecordExpense ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRecordExpense();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
              <span>Record an Expense</span>
            </button>
          ) : (
            <Link
              href="/expenses/new"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
              <span>Record an Expense</span>
            </Link>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            I'm Done
          </button>
        </div>
      </div>
    </div>
  );
}
