import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createAsset } from "@/lib/actions/misc";

export default async function AssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user!.id)
    .order("purchase_date", { ascending: false });

  const totalValue = (assets ?? []).reduce(
    (s, a) => s + Number(a.current_value ?? 0) * Number(a.quantity ?? 1),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Assets</h1>

      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <p className="text-xs text-ink/50">Total Asset Value</p>
        <p className="text-xl font-semibold">{formatNaira(totalValue)}</p>
      </div>

      <section className="space-y-2">
        {(assets ?? []).map((a) => {
          const gain = Number(a.current_value ?? 0) - Number(a.purchase_price ?? 0);
          const gainPct =
            Number(a.purchase_price ?? 0) > 0
              ? (gain / Number(a.purchase_price)) * 100
              : 0;
          return (
            <div key={a.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-ink/50">
                    {a.category} · {a.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatNaira(Number(a.current_value))}</p>
                  <p className={`text-xs ${gain >= 0 ? "text-accent" : "text-danger"}`}>
                    {gain >= 0 ? "+" : ""}
                    {gainPct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {(assets ?? []).length === 0 && (
          <p className="text-sm text-ink/50">No assets tracked yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Add Asset</h2>
        <form action={createAsset} className="mt-3 space-y-3">
          <input
            name="name"
            placeholder="Asset name"
            required
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <input
            name="category"
            placeholder="Category"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <input
            name="location"
            placeholder="Location / Platform"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="purchase_price"
              type="number"
              step="0.01"
              placeholder="Purchase price (₦)"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
            <input
              name="current_value"
              type="number"
              step="0.01"
              placeholder="Current value (₦)"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
          </div>
          <input
            name="purchase_date"
            type="date"
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Add Asset
          </button>
        </form>
      </section>
    </div>
  );
}
