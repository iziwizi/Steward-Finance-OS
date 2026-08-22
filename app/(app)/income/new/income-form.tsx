"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowDownLeft, X } from "lucide-react";
import { createIncomeTransaction } from "@/lib/actions/income";
import { IncomeSuccessDialog } from "@/components/income-success-dialog";

export function IncomeForm({
  accounts = [],
}: {
  accounts: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [recordedAmount, setRecordedAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createIncomeTransaction(formData);
      if (res.success && res.amount) {
        setRecordedAmount(res.amount);
        setShowSuccess(true);
      } else {
        setErrorMsg(res.error || "Failed to record income.");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-700">Date</span>
            <input
              type="date"
              name="txn_date"
              defaultValue={today}
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-700">Amount (₦)</span>
            <input
              type="number"
              name="amount"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 150000"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-700">Source / Client</span>
            <input
              type="text"
              name="source"
              placeholder="e.g. Salary, Client payment, Dividends"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-zinc-700">Account received into</span>
            <select
              name="account_id"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Description (Optional)</span>
          <input
            type="text"
            name="description"
            placeholder="e.g. August retainer milestone 1"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors text-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving & Calculating...</span>
              </>
            ) : (
              <>
                <ArrowDownLeft className="h-4 w-4" />
                <span>Save & Calculate Allocations</span>
              </>
            )}
          </button>
        </div>
      </form>

      <IncomeSuccessDialog
        amount={recordedAmount}
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push("/dashboard");
        }}
      />
    </>
  );
}
