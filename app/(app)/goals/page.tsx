import Link from "next/link";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, calculateGoalProgress } from "@/lib/finance/allocation-engine";
import { contributeToGoal } from "@/lib/actions/goals";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user!.id)
    .order("status")
    .order("target_date");

  const active = (goals ?? []).filter((g) => g.status !== "completed");
  const completed = (goals ?? []).filter((g) => g.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Link href="/goals/new" className="text-sm font-medium text-accent">
          + New Goal
        </Link>
      </div>

      <section className="space-y-3">
        {active.map((g) => {
          const { remaining, progressPercent } = calculateGoalProgress(
            Number(g.target_amount),
            Number(g.current_amount)
          );
          return (
            <div key={g.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-ink/50">
                    {g.category}
                    {g.target_date ? ` · due ${g.target_date}` : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold text-accent">{progressPercent}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-ink/10">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink/50">
                <span>{formatNaira(Number(g.current_amount))} saved</span>
                <span>{formatNaira(remaining)} remaining</span>
              </div>
              <form action={contributeToGoal} className="mt-3 flex gap-2">
                <input type="hidden" name="goal_id" value={g.id} />
                <input
                  type="number"
                  name="amount"
                  placeholder="Add contribution (₦)"
                  step="0.01"
                  min="0"
                  required
                  className="tap-target flex-1 rounded-xl border border-ink/15 bg-white px-3 text-sm"
                />
                <button className="tap-target rounded-xl bg-accent px-4 text-sm font-medium text-white">
                  Add
                </button>
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
        <section>
          <h2 className="text-sm font-semibold text-ink/70">Completed</h2>
          <div className="mt-2 space-y-2">
            {completed.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 p-4"
              >
                <p className="font-medium">{g.name}</p>
                <p className="text-sm text-accent">✓ {formatNaira(Number(g.target_amount))}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
