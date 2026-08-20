import { Gem, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createAsset } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export default async function AssetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user?.id)
    .order("purchase_date", { ascending: false });

  const totalValue = (assets ?? []).reduce(
    (s, a) => s + Number(a.current_value ?? 0) * Number(a.quantity ?? 1),
    0
  );

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Holdings</p>
        <h1 className="text-display-md text-zinc-900">Assets</h1>
      </div>

      <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Total Asset Portfolio</p>
        <p className="mt-1 text-financial-hero font-extrabold text-brand-500">{formatNaira(totalValue)}</p>
        <p className="mt-1 text-xs text-zinc-500">Tracked tangible, liquid, and capital assets</p>
      </div>

      <section className="space-y-3">
        {(assets ?? []).map((a) => {
          const gain = Number(a.current_value ?? 0) - Number(a.purchase_price ?? 0);
          const gainPct =
            Number(a.purchase_price ?? 0) > 0
              ? (gain / Number(a.purchase_price)) * 100
              : 0;
          return (
            <div key={a.id} className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Gem className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{a.name}</p>
                  <p className="text-xs text-zinc-400">
                    {a.category}{a.location ? ` · ${a.location}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-900">{formatNaira(Number(a.current_value))}</p>
                <p className={`text-[11px] font-semibold ${gain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {gain >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
        {(assets ?? []).length === 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center text-xs text-zinc-400">
            No assets tracked yet. Add your property, vehicle, equity, or high-value physical assets below.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Add Asset</h2>
        <form action={createAsset} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Asset Name</label>
            <input
              name="name"
              placeholder="e.g. Real Estate Parcel, MacBook Pro, Gold Bullion"
              required
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Category</label>
              <input
                name="category"
                placeholder="e.g. Property / Electronics"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Location</label>
              <input
                name="location"
                placeholder="e.g. Lagos / Home"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Purchase Price (₦)</label>
              <input
                name="purchase_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Current Value (₦)</label>
              <input
                name="current_value"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Record Asset
          </Button>
        </form>
      </section>
    </div>
  );
}
