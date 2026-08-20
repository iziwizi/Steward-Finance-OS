import Link from "next/link";
import { Target, Plus, CheckCircle2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { contributeToGoal } from "@/lib/actions/goals";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user?.id)
    .order("status")
    .order("target_date");

  const active = (goals ?? []).filter((g) => g.status !== "completed");
  const completed = (goals ?? []).filter((g) => g.status === "completed");

  const totalSaved = (goals ?? []).reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = (goals ?? []).reduce((s, g) => s + Number(g.target_amount), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Active Goals</h1>
          <p className="text-xs text-zinc-500">
            Set targets, track progress, and allocate for your long-term and short-term life objectives.
          </p>
        </div>
        <Link
          href="/goals/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Goal
        </Link>
      </div>

      {/* Top 4 Summary Metrics Cards matching Figma desktop-goals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Saved</p>
          <p className="mt-1 text-xl font-bold text-brand-600">{formatNaira(totalSaved)}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Across all goals</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Active Goals</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{active.length} Goals</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">In progress</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Completed Goals</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{completed.length} Goals</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Fully reached</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Target</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{formatNaira(totalTarget)}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Total funding needed</p>
        </div>
      </div>

      {/* 2x2 Grid of Goals matching Figma desktop-goals */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {active.map((g) => {
          const { remaining, progressPercent } = calculateGoalProgress(
            Number(g.target_amount),
            Number(g.current_amount)
          );
          return (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{g.name}</h3>
                    <p className="text-[11px] text-zinc-400">
                      {g.category} · {g.target_date ? `Target: ${g.target_date}` : "Ongoing"}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-xs font-bold text-brand-600">
                    {progressPercent}%
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-900">{formatNaira(Number(g.current_amount))}</span>
                    <span className="text-zinc-400">of {formatNaira(Number(g.target_amount))}</span>
                  </div>
                  <ProgressBar percent={progressPercent} tone="brand" className="mt-2 h-2" />
                  <p className="mt-1 text-right text-[10px] text-zinc-400">
                    {formatNaira(remaining)} remaining
                  </p>
                </div>
              </div>

              {/* Contribution Form */}
              <form action={contributeToGoal} className="flex gap-2 pt-2 border-t border-zinc-100">
                <input type="hidden" name="goal_id" value={g.id} />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (₦)"
                  step="0.01"
                  min="0"
                  required
                  className="tap-target flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                />
                <Button type="submit" variant="primary" className="px-3.5 py-1.5 text-xs">
                  + Add Contribution
                </Button>
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
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
              >
                <div>
                  <p className="text-xs font-bold text-zinc-900">{g.name}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    ✓ Goal Achieved: {formatNaira(Number(g.target_amount))}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
