"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target, Plus } from "lucide-react";
import { createGoal } from "@/lib/actions/goals";

export function GoalForm({
  buckets = [],
}: {
  buckets: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/goals");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createGoal(formData);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to create goal.");
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

      {/* Row 1: Goal Name & Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Goal Name</span>
          <input
            type="text"
            name="name"
            placeholder="e.g. Emergency Reserve, Rent Fund, Car Purchase"
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Category</span>
          <input
            type="text"
            name="category"
            placeholder="e.g. Housing, Savings, Capital Asset"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Row 2: Linked Bucket & Priority */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Linked Envelope (Optional)</span>
          <select
            name="bucket_id"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">None (Standalone Target)</option>
            {buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Priority Level</span>
          <select
            name="priority"
            defaultValue="Medium"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </label>
      </div>

      {/* Row 3: Target Amount & Initial Saved */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Target Amount (₦)</span>
          <input
            type="number"
            name="target_amount"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-zinc-700">Already Saved (₦)</span>
          <input
            type="number"
            name="current_amount"
            step="0.01"
            min="0"
            defaultValue={0}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Row 4: Target Date */}
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-zinc-700">Target Completion Date (Optional)</span>
        <input
          type="date"
          name="target_date"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {/* Row 5: Actions */}
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
              <span>Creating Goal...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Create Goal</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
