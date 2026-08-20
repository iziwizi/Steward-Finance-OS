import { Heart, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createWishlistItem } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user?.id)
    .order("date_added", { ascending: false });

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Goals & Wishes</p>
        <h1 className="text-display-md text-zinc-900">Wish List</h1>
      </div>

      <section className="space-y-3">
        {(items ?? []).map((i) => (
          <div key={i.id} className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{i.item_name}</p>
                <p className="text-xs text-zinc-400">
                  {i.category} · <span className="capitalize">{i.priority} priority</span>
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-zinc-900">{formatNaira(Number(i.estimated_cost ?? 0))}</p>
          </div>
        ))}
        {(items ?? []).length === 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center text-xs text-zinc-400">
            Nothing on your wish list yet. Add items you are planning to purchase in the future.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">Add Item</h2>
        <form action={createWishlistItem} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Item Name</label>
            <input
              name="item_name"
              placeholder="e.g. Ergonomic Office Chair"
              required
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Category</label>
              <input
                name="category"
                placeholder="e.g. Work / Home"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Estimated Cost (₦)</label>
              <input
                name="estimated_cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Priority</label>
            <select
              name="priority"
              defaultValue="medium"
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Save to Wish List
          </Button>
        </form>
      </section>
    </div>
  );
}
