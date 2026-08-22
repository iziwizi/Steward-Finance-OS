"use client";

import { useMemo, useState, useTransition } from "react";
import {
  saveOnboardingAllocations,
  createOnboardingBucket,
  deleteOnboardingBucket,
  applyStarterTemplate,
} from "@/lib/actions/onboarding";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Plus, Trash2, Sparkles, Loader2, PieChart } from "lucide-react";

type Bucket = { id: string; name: string; purpose?: string | null; target_percent: number };

export function AllocationsForm({ buckets = [] }: { buckets: Bucket[] }) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newPercent, setNewPercent] = useState("10");

  const [percents, setPercents] = useState<Record<string, number>>(() =>
    Object.fromEntries(buckets.map((b) => [b.id, Number(b.target_percent)]))
  );

  // Sync if bucket list changes from server
  const currentPercents = useMemo(() => {
    const p: Record<string, number> = {};
    for (const b of buckets) {
      p[b.id] = percents[b.id] !== undefined ? percents[b.id] : Number(b.target_percent);
    }
    return p;
  }, [buckets, percents]);

  const total = useMemo(
    () => Object.values(currentPercents).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
    [currentPercents]
  );

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const fd = new FormData();
    fd.append("name", newName.trim());
    fd.append("purpose", newPurpose.trim());
    fd.append("target_percent", newPercent || "0");

    startTransition(async () => {
      await createOnboardingBucket(fd);
      setNewName("");
      setNewPurpose("");
      setNewPercent("10");
      setShowAddForm(false);
    });
  };

  const handleDeleteBucket = (id: string) => {
    startTransition(async () => {
      await deleteOnboardingBucket(id);
    });
  };

  const handleApplyStarter = () => {
    startTransition(async () => {
      await applyStarterTemplate();
    });
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Total Progress Bar */}
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-zinc-400" />
            <span>Total Income Allocated</span>
          </span>
          <span
            className={`font-extrabold text-sm ${
              total === 100 ? "text-emerald-600" : total > 100 ? "text-rose-600" : "text-amber-600"
            }`}
          >
            {total.toFixed(1)}% {total === 100 ? "✓ Complete" : total > 100 ? "(Over 100%)" : "(Remaining: " + (100 - total).toFixed(1) + "%)"}
          </span>
        </div>
        <ProgressBar percent={total} tone={total > 100 ? "danger" : total === 100 ? "income" : "brand"} className="h-2 rounded-full" />
      </div>

      {/* Empty State vs Bucket List */}
      {buckets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <PieChart className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-900">No Allocation Envelopes Yet</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Create your own custom categories (e.g. Rent, Savings, Giving, Family) or start with standard neutral templates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-600 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Custom Envelope</span>
            </button>
            <button
              type="button"
              onClick={handleApplyStarter}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span>Use Starter Suggestions</span>
            </button>
          </div>
        </div>
      ) : (
        <form action={saveOnboardingAllocations} className="space-y-5">
          <div className="space-y-2.5">
            {buckets.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-zinc-300"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-bold text-zinc-900">{b.name}</p>
                  {b.purpose && (
                    <p className="truncate text-[11px] text-zinc-400 mt-0.5">{b.purpose}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      name={`percent_${b.id}`}
                      step="0.5"
                      min={0}
                      max={100}
                      value={currentPercents[b.id] ?? 0}
                      onChange={(e) =>
                        setPercents((prev) => ({ ...prev, [b.id]: Number(e.target.value) }))
                      }
                      className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-right text-xs sm:text-sm font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                    />
                    <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">
                      %
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBucket(b.id)}
                    disabled={isPending}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                    title="Remove envelope"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Envelope</span>
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Envelopes...
                </span>
              ) : (
                "Save &amp; Continue to Accounts"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Add Custom Bucket Modal / Drawer */}
      {showAddForm && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-900">New Allocation Envelope</p>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddBucket} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Envelope Name (e.g. Housing)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
              />
              <div className="relative">
                <input
                  type="number"
                  placeholder="Target % (e.g. 25)"
                  value={newPercent}
                  onChange={(e) => setNewPercent(e.target.value)}
                  min={0}
                  max={100}
                  step="0.5"
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Purpose / Intent (Optional e.g. Rent, repairs, electricity)"
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending || !newName.trim()}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 disabled:opacity-50 transition-all"
              >
                Add Envelope
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
