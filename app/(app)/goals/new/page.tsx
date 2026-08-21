import { createClient } from "@/lib/supabase/server";
import { createGoal } from "@/lib/actions/goals";
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
    .order("sort_order");

  return (
    <div className="space-y-4">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="New Goal" fallbackHref="/goals" />

      <h1 className="hidden md:block text-2xl font-semibold">New Goal</h1>
      <form action={createGoal} className="space-y-4">
        <Field label="Goal name">
          <input
            type="text"
            name="name"
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            name="category"
            placeholder="e.g. House Rent, Car Purchase"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Linked bucket (optional)">
          <select
            name="bucket_id"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          >
            <option value="">None</option>
            {(buckets ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            name="priority"
            defaultValue="Medium"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </Field>
        <Field label="Target amount (₦)">
          <input
            type="number"
            name="target_amount"
            step="0.01"
            min="0"
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Already saved (₦)">
          <input
            type="number"
            name="current_amount"
            step="0.01"
            min="0"
            defaultValue={0}
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Target date">
          <input
            type="date"
            name="target_date"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
          Create Goal
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}
