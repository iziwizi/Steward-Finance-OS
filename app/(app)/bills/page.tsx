import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createBill, markBillPaid } from "@/lib/actions/misc";
import { EmptyState } from "@/components/ui/empty-state";

export default async function BillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: bills }, { data: accounts }] = await Promise.all([
    supabase.from("bills").select("*").eq("user_id", user!.id).order("next_due"),
    supabase.from("accounts").select("id, name").eq("user_id", user!.id).order("name"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bills</h1>

      <section className="space-y-2">
        {(bills ?? []).map((b) => {
          const daysRemaining = b.next_due
            ? Math.ceil((new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000)
            : null;
          const overdue = daysRemaining !== null && daysRemaining < 0;
          return (
            <div key={b.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-ink/50">
                    {b.frequency} · next due {b.next_due ?? "—"}
                    {daysRemaining !== null && (
                      <span className={overdue ? "text-danger" : ""}>
                        {" "}
                        ({overdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d`})
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-semibold">{formatNaira(Number(b.amount))}</p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await markBillPaid(b.id);
                }}
                className="mt-2"
              >
                <button className="tap-target rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                  Mark Paid
                </button>
              </form>
            </div>
          );
        })}
        {(bills ?? []).length === 0 && (
          <EmptyState
            icon={CreditCard}
            title="No bills tracked"
            description="Add your recurring subscriptions and household bills to stay ahead and protect your allocations."
          />
        )}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Add Bill</h2>
        <form action={createBill} className="mt-3 space-y-3">
          <input
            name="name"
            placeholder="Bill name"
            required
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <input
            name="category"
            placeholder="Category"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount (₦)"
              required
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
            <select
              name="frequency"
              defaultValue="monthly"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <input
            name="due_date"
            type="date"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <select
            name="account_id"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          >
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Add Bill
          </button>
        </form>
      </section>
    </div>
  );
}
