"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpRight, Check } from "lucide-react";
import { recordExpense } from "@/lib/actions/expenses";

export function ExpenseForm({
  accounts = [],
  buckets = [],
}: {
  accounts: Array<{ id: string; name: string }>;
  buckets: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/transactions");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await recordExpense(formData);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to log expense.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Row 1: Date & Bucket */}
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
          <span className="mb-1 block text-xs font-bold text-zinc-700">Budget Envelope / Bucket</span>
          <select
            name="bucket_id"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          >
            {buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Row 2: Reason & Vendor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Reason</span>
          <input
            type="text"
            name="reason"
            placeholder="e.g. Groceries, Fuel, Cloud Hosting"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Vendor / Merchant</span>
          <input
            type="text"
            name="vendor"
            placeholder="e.g. Shoprite, Uber, AWS"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Row 3: Payment Account & Amount */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Payment Account</span>
          <select
            name="payment_account_id"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
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
            placeholder="0.00"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Row 4: Description (Full Width) */}
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-zinc-700">Description (Optional)</span>
        <input
          type="text"
          name="description"
          placeholder="e.g. Weekly family provisions from supermarket"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {/* Row 5: Receipt Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Receipt / Payment Status</span>
          <select
            name="receipt_status"
            defaultValue="paid"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid / Pending Invoice</option>
            <option value="na">N/A</option>
          </select>
        </label>
      </div>

      {/* Row 6: Actions */}
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
              <span>Saving Expense...</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="h-4 w-4" />
              <span>Save Expense</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
