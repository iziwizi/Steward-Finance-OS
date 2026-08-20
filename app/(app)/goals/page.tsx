import Link from "next/link";
import { Target, Plus } from "lucide-react";
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

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Targets</p>
          <h1 className="text-display-md text-zinc-900">Goals</h1>
        </div>
        <Link
          href="/goals/new"
          className="tap-target inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New Goal
        </Link>
      </div>

      <section className="space-y-3.5">
        {active.map((g) => {
          const { remaining, progressPercent } = calculateGoalProgress(
            Number(g.target_amount),
            Number(g.current_amount)
          );
          return (
            <div key={g.id} className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base font-bold text-zinc-900">{g.name}</p>
                  <p className="text-xs text-zinc-400">
                    {g.category}
                    {g.target_date ? ` · Target: ${g.target_date}` : ""}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-600">{progressPercent}%</span>
              </div>

              <ProgressBar percent={progressPercent} tone="brand" className="mt-3.5 h-2" />

              <div className="mt-2.5 flex justify-between text-xs text-zinc-500 font-medium">
                <span>{formatNaira(Number(g.current_amount))} saved</span>
                <span>{formatNaira(remaining)} remaining</span>
              </div>

              <form action={contributeToGoal} className="mt-4 flex gap-2">
                <input type="hidden" name="goal_id" value={g.id} />
                <input
                  type="number"
                  name="amount"
                  placeholder="Add contribution (₦)"
                  step="0.01"
                  min="0"
                  required
                  className="tap-target flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button type="submit" variant="primary" className="px-4 py-2 text-xs">
                  Contribute
                </Button>
              </form>
            </div>
          );
        })}
        {active.length === 0 && (
          <EmptyState
            icon={Target}
            title="No goals set"
            description="Start working toward something meaningful. Plan emergency funds, savings, or direct asset purchases."
            actionLabel="Create a Goal"
            actionHref="/goals/new"
          />
        )}
      </section>

      {completed.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Completed Goals</h2>
          <div className="space-y-2">
            {completed.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
              >
                <p className="text-sm font-semibold text-zinc-900">{g.name}</p>
                <p className="text-xs font-bold text-emerald-600">✓ {formatNaira(Number(g.target_amount))}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
