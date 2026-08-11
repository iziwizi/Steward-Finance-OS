import { createClient } from "@/lib/supabase/server";
import { recordIncome } from "@/lib/actions/income";

export default async function NewIncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Record Income</h1>
      <form action={recordIncome} className="space-y-4">
        <Field label="Date">
          <input
            type="date"
            name="txn_date"
            defaultValue={today}
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Source">
          <input
            type="text"
            name="source"
            placeholder="e.g. Salary, Client payment"
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Account received into">
          <select
            name="account_id"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          >
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (₦)">
          <input
            type="number"
            name="amount"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Description">
          <input
            type="text"
            name="description"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <button
          type="submit"
          className="tap-target w-full rounded-xl bg-accent font-medium text-white"
        >
          Save & Calculate Allocations
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
