import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "./goal-form";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function NewGoalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id, name")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="New Goal" fallbackHref="/goals" />

      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Create Financial Goal</h1>
        <p className="text-xs text-zinc-500">
          Establish milestone targets and track recurring contributions toward your life objectives.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs">
        <GoalForm buckets={buckets ?? []} />
      </div>
    </div>
  );
}
