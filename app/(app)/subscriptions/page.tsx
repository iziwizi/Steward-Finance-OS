import { RefreshCw, Calendar, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createSubscription } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .order("next_renewal_date");

  const monthlyTotal = (subs ?? []).reduce((sum, s) => {
    const cost = Number(s.cost);
    if (s.billing_cycle === "yearly") return sum + cost / 12;
    if (s.billing_cycle === "weekly") return sum + cost * 4.33;
    return sum + cost;
  }, 0);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Recurring</p>
        <h1 className="text-display-md text-zinc-900">Subscriptions</h1>
      </div>

      <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Total Monthly Cost</p>
        <p className="mt-1 text-financial-hero font-extrabold text-brand-500">{formatNaira(monthlyTotal)}</p>
        <p className="mt-1 text-xs text-zinc-500">Committed recurring digital and lifestyle subscriptions</p>
      </div>

      <section className="space-y-3">
        {(subs ?? []).map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{s.service_name}</p>
                <p className="text-xs text-zinc-400">
                  {s.plan ? `${s.plan} · ` : ""}{s.billing_cycle} · Renews {s.next_renewal_date ?? "—"}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-zinc-900">{formatNaira(Number(s.cost))}</p>
          </div>
        ))}
        {(subs ?? []).length === 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center text-xs text-zinc-400">
            No subscriptions tracked yet. Add your recurring software, streaming, and mobile subscriptions below.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Add Subscription</h2>
        <form action={createSubscription} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Service Name</label>
            <input
              name="service_name"
              placeholder="e.g. Netflix, Spotify, iCloud"
              required
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Category</label>
              <input
                name="category"
                placeholder="e.g. Entertainment"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Plan</label>
              <input
                name="plan"
                placeholder="e.g. Premium / Standard"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Cost (₦)</label>
              <input
                name="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Billing Cycle</label>
              <select
                name="billing_cycle"
                defaultValue="monthly"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Next Renewal Date</label>
            <input
              name="next_renewal_date"
              type="date"
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Add Subscription
          </Button>
        </form>
      </section>
    </div>
  );
}
