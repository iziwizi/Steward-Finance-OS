import { CreditCard, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createBill, markBillPaid } from "@/lib/actions/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function BillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: bills }, { data: accounts }] = await Promise.all([
    supabase.from("bills").select("*").eq("user_id", user?.id).order("next_due"),
    supabase.from("accounts").select("id, name").eq("user_id", user?.id).order("name"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Recurring</p>
        <h1 className="text-display-md text-zinc-900">Bills</h1>
      </div>

      <section className="space-y-3">
        {(bills ?? []).map((b) => {
          const daysRemaining = b.next_due
            ? Math.ceil((new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000)
            : null;
          const overdue = daysRemaining !== null && daysRemaining < 0;
          return (
            <div key={b.id} className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-zinc-900">{b.name}</p>
                    {overdue && (
                      <Badge tone="danger">
                        {Math.abs(daysRemaining!)}d overdue
                      </Badge>
                    )}
                    {!overdue && daysRemaining !== null && daysRemaining <= 3 && (
                      <Badge tone="warning">
                        Due in {daysRemaining}d
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {b.frequency} · Next due {b.next_due ?? "—"}
                  </p>
                </div>
                <p className="text-base font-bold text-zinc-900">{formatNaira(Number(b.amount))}</p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await markBillPaid(b.id);
                }}
                className="mt-3"
              >
                <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Mark as Paid
                </Button>
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

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Add New Bill</h2>
        <form action={createBill} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Bill Name</label>
            <input
              name="name"
              placeholder="e.g. Electricity / Internet"
              required
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Category</label>
            <input
              name="category"
              placeholder="e.g. Utilities"
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Amount (₦)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Frequency</label>
              <select
                name="frequency"
                defaultValue="monthly"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Due Date</label>
              <input
                name="due_date"
                type="date"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Funding Account</label>
              <select
                name="account_id"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {(accounts ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Add Bill
          </Button>
        </form>
      </section>
    </div>
  );
}
