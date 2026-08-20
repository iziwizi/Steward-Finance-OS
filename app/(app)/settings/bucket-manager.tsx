"use client";

import { useState, useTransition } from "react";
import { updateBucket, createBucket, toggleBucketActive, moveBucket, deleteBucket } from "@/lib/actions/buckets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Trash2, Check, AlertCircle, Loader2, Plus } from "lucide-react";

export function BucketManager({
  buckets,
  accounts,
}: {
  buckets: any[];
  accounts: any[];
}) {
  const [feedback, setFeedback] = useState<{ id?: string; type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const splitTotal = buckets
    .filter((b) => b.is_income_split && b.is_active)
    .reduce((s, b) => s + Number(b.target_percent), 0);

  const handleUpdateBucket = async (e: React.FormEvent<HTMLFormElement>, bucketId: string) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateBucket(formData);
        setFeedback({ id: bucketId, type: "success", text: "Bucket updated successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ id: bucketId, type: "error", text: err.message || "Could not save changes." });
      }
    });
  };

  const handleCreateBucket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createBucket(formData);
        form.reset();
        setFeedback({ type: "success", text: "New bucket added successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ type: "error", text: err.message || "Could not create bucket." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Allocation Percentages & Buckets</h2>
          <p className="text-xs text-zinc-400">
            Define how your received income splits into purposeful financial vaults.
          </p>
        </div>
        {splitTotal !== 100 ? (
          <Badge tone="warning">Income Split: {splitTotal}%</Badge>
        ) : (
          <Badge tone="success">100% Allocated</Badge>
        )}
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Bucket List */}
      <div className="space-y-3">
        {buckets.map((b, i) => (
          <div
            key={b.id}
            className={`rounded-xl border p-4 shadow-xs transition-all ${
              b.is_active ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50/70 opacity-60"
            }`}
          >
            <form onSubmit={(e) => handleUpdateBucket(e, b.id)} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={b.id} />
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Bucket Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={b.name}
                  required
                  className="tap-target mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="w-20">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Target %
                </label>
                <input
                  type="number"
                  name="target_percent"
                  defaultValue={b.target_percent}
                  step="0.1"
                  min="0"
                  max="100"
                  disabled={!b.is_income_split}
                  className="tap-target mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-center text-zinc-900 focus:border-brand-500 focus:outline-none disabled:bg-zinc-100"
                />
              </div>

              <div className="w-44">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Funding Account
                </label>
                <select
                  name="default_account_id"
                  defaultValue={b.default_account_id ?? ""}
                  className="tap-target mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">No default account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pt-4">
                <Button type="submit" variant="primary" disabled={isPending} className="px-3 py-1.5 text-xs">
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                </Button>
              </div>
            </form>

            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <form action={moveBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="tap-target flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={moveBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === buckets.length - 1}
                    className="tap-target flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-3">
                <form action={toggleBucketActive}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="is_active" value={(!b.is_active).toString()} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                  >
                    {b.is_active ? "Disable" : "Enable"}
                  </button>
                </form>

                <form action={deleteBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-rose-600"
                    title="Delete bucket"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Bucket Form */}
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-4">
        <h3 className="text-xs font-bold text-zinc-900 mb-2">Create New Allocation Bucket</h3>
        <form onSubmit={handleCreateBucket} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="name"
            placeholder="e.g. Vacation, Investment, Tithe"
            required
            className="tap-target min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
          />
          <input
            type="number"
            name="target_percent"
            placeholder="%"
            step="0.1"
            min="0"
            max="100"
            defaultValue="10"
            className="tap-target w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-center focus:border-brand-500 focus:outline-none"
          />
          <input type="hidden" name="is_income_split" value="on" />
          <Button type="submit" variant="primary" disabled={isPending} className="px-4 py-1.5 text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Bucket
          </Button>
        </form>
      </div>
    </div>
  );
}
