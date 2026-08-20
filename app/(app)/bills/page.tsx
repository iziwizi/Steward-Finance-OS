import { CreditCard, Check, AlertCircle, RefreshCw, Calendar, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createBill, markBillPaid, createSubscription } from "@/lib/actions/misc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = params.filter || "all";

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

  const filteredBills = (bills ?? []).filter((b) => {
    if (currentFilter === "all") return true;
    const daysRemaining = b.next_due
      ? Math.ceil((new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000)
      : null;
    if (currentFilter === "due_soon") return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
    if (currentFilter === "upcoming") return daysRemaining !== null && daysRemaining > 7;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-bills-subs */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Bills & Subscriptions</h1>
          <p className="text-xs text-zinc-500">
            Manage your recurring monthly bills and service commitments.
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout matching Figma desktop-bills-subs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Active Bills (8/12 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            {/* Filter Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <h2 className="text-sm font-bold text-zinc-900">Active Bills</h2>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All Bills" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "due_soon", label: "Due Soon" },
                ].map((f) => (
                  <a
                    key={f.id}
                    href={`/bills?filter=${f.id}`}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      currentFilter === f.id
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {f.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Bills List */}
            <div className="divide-y divide-zinc-100 mt-2">
              {filteredBills.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No bills registered under this filter.
                </div>
              ) : (
                filteredBills.map((b) => {
                  const daysRemaining = b.next_due
                    ? Math.ceil(
                        (new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000
                      )
                    : null;
                  const isDueSoon = daysRemaining !== null && daysRemaining <= 5 && daysRemaining >= 0;
                  const isOverdue = daysRemaining !== null && daysRemaining < 0;

                  return (
                    <div key={b.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{b.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          {b.next_due ? `Due: ${b.next_due}` : "Recurring"} · {b.frequency}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {isOverdue ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            Overdue
                          </span>
                        ) : isDueSoon ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                            Due Soon
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Upcoming
                          </span>
                        )}

                        <span className="text-xs font-bold text-zinc-900 w-24 text-right">
                          {formatNaira(Number(b.amount))}
                        </span>

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
                            Pay Now
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
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
                  className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
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
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Frequency</label>
                  <select
                    name="frequency"
                    defaultValue="monthly"
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
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
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Funding Account</label>
                  <select
                    name="account_id"
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    {(accounts ?? []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" variant="primary" className="px-4 py-2 text-xs">
                Add Bill
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Dark Teal TOTAL MONTHLY SUBS Card + Active Service Cards (4/12 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl bg-brand-500 p-6 text-white shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">
              Total Monthly Subs
            </span>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              {formatNaira(totalSubsMonthly || totalBillsMonthly)}
            </p>
            <p className="mt-1 text-xs text-brand-100/80">
              All payments clear via pre-authorized mandate.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Active Service Cards</h2>
              <span className="text-xs font-semibold text-zinc-400">
                {(subs ?? []).length} active
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {(subs ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-zinc-400">No subscriptions registered.</p>
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
                          {sub.billing_cycle} · {formatNaira(Number(sub.cost))}/mo
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {sub.next_renewal_date ? sub.next_renewal_date.slice(5) : "Active"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Subscription Form */}
            <form action={createSubscription} className="mt-3 pt-3 border-t border-zinc-100 space-y-2.5">
              <input
                name="service_name"
                placeholder="New Subscription (e.g. Notion, Spotify)"
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
