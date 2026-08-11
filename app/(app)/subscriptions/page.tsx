import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createSubscription } from "@/lib/actions/misc";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .order("next_renewal_date");

  const monthlyTotal = (subs ?? []).reduce((sum, s) => {
    const cost = Number(s.cost);
    if (s.billing_cycle === "yearly") return sum + cost / 12;
    if (s.billing_cycle === "weekly") return sum + cost * 4.33;
    return sum + cost;
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Subscriptions</h1>

      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <p className="text-xs text-ink/50">Total Monthly Cost</p>
        <p className="text-xl font-semibold">{formatNaira(monthlyTotal)}</p>
      </div>

      <section className="space-y-2">
        {(subs ?? []).map((s) => (
          <div key={s.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{s.service_name}</p>
                <p className="text-xs text-ink/50">
                  {s.plan} · {s.billing_cycle} · renews {s.next_renewal_date ?? "—"}
                </p>
              </div>
              <p className="font-semibold">{formatNaira(Number(s.cost))}</p>
            </div>
          </div>
        ))}
        {(subs ?? []).length === 0 && (
          <p className="text-sm text-ink/50">No subscriptions tracked yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Add Subscription</h2>
        <form action={createSubscription} className="mt-3 space-y-3">
          <input
            name="service_name"
            placeholder="Service name"
            required
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <input
            name="category"
            placeholder="Category"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <input
            name="plan"
            placeholder="Plan"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="cost"
              type="number"
              step="0.01"
              placeholder="Cost (₦)"
              required
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
            <select
              name="billing_cycle"
              defaultValue="monthly"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <input
            name="next_renewal_date"
            type="date"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Add Subscription
          </button>
        </form>
      </section>
    </div>
  );
}
