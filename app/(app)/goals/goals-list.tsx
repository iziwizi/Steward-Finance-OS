"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Target, Plus, CheckCircle2, Trash2, Edit3, Loader2, X, Check } from "lucide-react";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { contributeToGoal, updateGoal, deleteGoal } from "@/lib/actions/goals";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";

export interface GoalRecord {
  id: string;
  name: string;
  category: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: string;
}

export function GoalsList({
  goals = [],
}: {
  goals: GoalRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editingGoal, setEditingGoal] = useState<GoalRecord | null>(null);
  const [contributeAmounts, setContributeAmounts] = useState<Record<string, string>>({});

  const active = goals.filter((g) => g.status !== "completed");
  const completed = goals.filter((g) => g.status === "completed");

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  const handleContribute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await contributeToGoal(formData);
      const goalId = String(formData.get("goal_id") || "");
      setContributeAmounts((prev) => ({ ...prev, [goalId]: "" }));
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateGoal(formData);
      setEditingGoal(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteGoal(id);
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Goals</h1>
          <p className="text-xs text-zinc-500">
            Define, structure, and save for your long-term and short-term life objectives.
          </p>
        </div>
        <Link
          href="/goals/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create New Goal</span>
        </Link>
      </div>

      {/* 4 Summary Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Saved Balance</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700">
              Active Fund
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-zinc-900 break-words">{formatNaira(totalSaved)}</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Goals Count</p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
              On Track
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-zinc-900">{active.length} Goals</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Completed Goals</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700">
              Achieved
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-emerald-600">{completed.length} Goals</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Funding Target</p>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-600">
              Target
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-zinc-900 break-words">{formatNaira(totalTarget)}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-fast">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Edit Goal: {editingGoal.name}</h2>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingGoal.id} />
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Goal Title</label>
                <input
                  name="name"
                  defaultValue={editingGoal.name}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingGoal.category || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Target Date</label>
                  <input
                    name="target_date"
                    type="date"
                    defaultValue={editingGoal.target_date || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Target Amount (₦)</label>
                  <input
                    name="target_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingGoal.target_amount}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Current Saved (₦)</label>
                  <input
                    name="current_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingGoal.current_amount}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2x2 Grid of Active Goal Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {active.map((g) => {
          const { remaining, progressPercent } = calculateGoalProgress(
            Number(g.target_amount),
            Number(g.current_amount)
          );
          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-4 hover:border-zinc-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-zinc-900 truncate">{g.name}</h3>
                    <p className="text-[11px] text-zinc-400">
                      Target: {g.target_date ? g.target_date : "Ongoing"} {g.category ? `• ${g.category}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-xs font-bold text-brand-600">
                      {progressPercent}%
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingGoal(g)}
                      className="p-1 text-zinc-400 hover:text-brand-600 rounded"
                      title="Edit Goal"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete goal "${g.name}"?`)) {
                          handleDelete(g.id);
                        }
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Saved Amount</p>
                      <p className="font-bold text-zinc-900 text-sm">{formatNaira(Number(g.current_amount))}</p>
                      <p className="text-[10px] text-zinc-400">of {formatNaira(Number(g.target_amount))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Remaining</p>
                      <p className="font-bold text-brand-600 text-sm">{formatNaira(remaining)}</p>
                    </div>
                  </div>
                  <ProgressBar percent={progressPercent} tone="brand" className="mt-2.5 h-2" />
                </div>
              </div>

              {/* Contribution Form */}
              <form onSubmit={handleContribute} className="flex gap-2 pt-3 border-t border-zinc-100">
                <input type="hidden" name="goal_id" value={g.id} />
                <input
                  type="number"
                  name="amount"
                  value={contributeAmounts[g.id] || ""}
                  onChange={(e) =>
                    setContributeAmounts({ ...contributeAmounts, [g.id]: e.target.value })
                  }
                  placeholder="Amount (₦)"
                  step="0.01"
                  min="0"
                  required
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Add Funds</span>
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {active.length === 0 && (
        <EmptyState
          icon={Target}
          title="No active goals"
          description="Start working toward something meaningful. Plan emergency funds, savings, or direct asset purchases."
          actionLabel="Create a Goal"
          actionHref="/goals/new"
        />
      )}

      {/* Completed Archive */}
      {completed.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Completed Goals
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {completed.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs"
              >
                <div>
                  <p className="text-xs font-bold text-zinc-900">{g.name}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    ✓ Goal Achieved: {formatNaira(Number(g.target_amount))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete completed goal "${g.name}"?`)) {
                        handleDelete(g.id);
                      }
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                    title="Delete Goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
