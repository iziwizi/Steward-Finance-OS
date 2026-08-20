import { CreditCard, Check, AlertCircle, RefreshCw, Calendar, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createBill, markBillPaid, createSubscription } from "@/lib/actions/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function BillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bills }, { data: subs }, { data: accounts }] = await Promise.all([
    supabase.from("bills").select("*").eq("user_id", user?.id).order("next_due"),
    supabase.from("subscriptions").select("*").eq("user_id", user?.id).order("next_renewal_date"),
    supabase.from("accounts").select("id, name").eq("user_id", user?.id).order("name"),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const totalBillsMonthly = (bills ?? []).reduce((s, b) => {
    const cost = Number(b.amount);
    if (b.frequency === "yearly") return s + cost / 12;
    if (b.frequency === "weekly") return s + cost * 4.33;
    return s + cost;
  }, 0);

  const totalSubsMonthly = (subs ?? []).reduce((s, sub) => {
    const cost = Number(sub.cost);
    if (sub.billing_cycle === "yearly") return s + cost / 12;
    if (sub.billing_cycle === "weekly") return s + cost * 4.33;
    return s + cost;
  }, 0);

  const totalCommitted = totalBillsMonthly + totalSubsMonthly;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Bills & Subscriptions</h1>
        <p className="text-xs text-zinc-500">
          Manage your recurring monthly bills and service commitments.
        </p>
      </div>

      {/* Main 2-Column Layout matching Figma desktop-bills-subs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Active Bills Table */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h2 className="text-sm font-bold text-zinc-900">Active Bills</h2>
              <span className="text-xs font-semibold text-zinc-400">
                {(bills ?? []).length} registered
              </span>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-2.5 pr-3">Bill Name</th>
                    <th className="py-2.5 px-3">Next Due</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(bills ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">
                        No recurring bills registered yet.
                      </td>
                    </tr>
                  ) : (
                    (bills ?? []).map((b) => {
                      const daysRemaining = b.next_due
                        ? Math.ceil(
                            (new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000
                          )
                        : null;
                      const overdue = daysRemaining !== null && daysRemaining < 0;
                      return (
                        <tr key={b.id} className="transition-colors hover:bg-zinc-50/70">
                          <td className="py-3 pr-3 font-semibold text-zinc-900">
                            <div>
                              {b.name}
                              <p className="text-[10px] font-normal text-zinc-400 capitalize">
                                {b.frequency} · {b.category || "General"}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-zinc-500 font-medium">{b.next_due ?? "—"}</td>
                          <td className="py-3 px-3">
                            {overdue ? (
                              <Badge tone="danger">{Math.abs(daysRemaining!)}d overdue</Badge>
                            ) : daysRemaining !== null && daysRemaining <= 3 ? (
                              <Badge tone="warning">Due in {daysRemaining}d</Badge>
                            ) : (
                              <Badge tone="success">Upcoming</Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-zinc-900">
                            {formatNaira(Number(b.amount))}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <form
                              action={async () => {
                                "use server";
                                await markBillPaid(b.id);
                              }}
                            >
                              <Button
                                type="submit"
                                variant="secondary"
                                className="px-2.5 py-1 text-[11px]"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Pay Now
                              </Button>
                            </form>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Bill Form */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900">Register New Bill</h2>
            <form action={createBill} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Bill Name</label>
                <input
                  name="name"
                  placeholder="e.g. Electricity, Internet, HOA"
                  required
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
                  <label className="text-xs font-semibold text-zinc-700">Next Due Date</label>
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
          </div>
        </div>

        {/* Right Column: Dark Teal Committed Card + Active Subscriptions */}
        <div className="space-y-6 lg:col-span-4">
          {/* Dark Teal Summary Card matching Figma desktop-bills-subs */}
          <div className="rounded-xl bg-brand-500 p-6 text-white shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
              Total Monthly Committed
            </span>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              {formatNaira(totalCommitted)}
            </p>
            <p className="mt-1 text-xs text-brand-100/80">
              {formatNaira(totalBillsMonthly)} in bills + {formatNaira(totalSubsMonthly)} in subscriptions
            </p>
          </div>

          {/* Active Subscriptions Card */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Active Subscriptions</h2>
              <span className="text-xs font-semibold text-zinc-400">
                {(subs ?? []).length} active
              </span>
            </div>

            <div className="mt-3 divide-y divide-zinc-100">
              {(subs ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-zinc-400">No subscriptions added yet.</p>
              ) : (
                (subs ?? []).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{sub.service_name}</p>
                        <p className="text-[10px] text-zinc-400 capitalize">
                          {sub.plan ? `${sub.plan} · ` : ""}
                          {sub.billing_cycle}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-900">
                      {formatNaira(Number(sub.cost))}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Subscription Form */}
            <form action={createSubscription} className="mt-4 pt-3 border-t border-zinc-100 space-y-2.5">
              <input
                name="service_name"
                placeholder="New Subscription (e.g. Netflix)"
                required
                className="tap-target w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:border-brand-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="cost"
                  type="number"
                  step="0.01"
                  placeholder="Cost (₦)"
                  required
                  className="tap-target w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:border-brand-500 focus:outline-none"
                />
                <select
                  name="billing_cycle"
                  defaultValue="monthly"
                  className="tap-target w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:border-brand-500 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <Button type="submit" variant="secondary" className="w-full text-xs py-1.5">
                + Add Subscription
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
