import { createClient } from "@/lib/supabase/server";
import { recordExpense } from "@/lib/actions/expenses";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: accounts }, { data: buckets }] = await Promise.all([
    supabase.from("accounts").select("id, name").eq("user_id", user!.id).order("name"),
    supabase
      .from("budget_buckets")
      .select("id, name")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Log Expense</h1>
      <form action={recordExpense} className="space-y-4">
        <Field label="Date">
          <input
            type="date"
            name="txn_date"
            defaultValue={today}
            required
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Bucket">
          <select
            name="bucket_id"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          >
            {(buckets ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reason">
          <input
            type="text"
            name="reason"
            placeholder="e.g. Groceries, Data"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Vendor">
          <input
            type="text"
            name="vendor"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          />
        </Field>
        <Field label="Payment account">
          <select
            name="payment_account_id"
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
        <Field label="Receipt status">
          <select
            name="receipt_status"
            defaultValue="paid"
            className="tap-target w-full rounded-xl border border-ink/15 bg-white px-4"
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="na">N/A</option>
          </select>
        </Field>
        <button
          type="submit"
          className="tap-target w-full rounded-xl bg-accent font-medium text-white"
        >
          Save Expense
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
