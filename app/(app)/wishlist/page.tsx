import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createWishlistItem } from "@/lib/actions/misc";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user!.id)
    .order("date_added", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Wish List</h1>

      <section className="space-y-2">
        {(items ?? []).map((i) => (
          <div key={i.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{i.item_name}</p>
                <p className="text-xs text-ink/50">
                  {i.category} · {i.priority} priority
                </p>
              </div>
              <p className="font-semibold">{formatNaira(Number(i.estimated_cost ?? 0))}</p>
            </div>
          </div>
        ))}
        {(items ?? []).length === 0 && (
          <p className="text-sm text-ink/50">Nothing on the wish list yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Add Item</h2>
        <form action={createWishlistItem} className="mt-3 space-y-3">
          <input
            name="item_name"
            placeholder="Item name"
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
              name="estimated_cost"
              type="number"
              step="0.01"
              placeholder="Estimated cost (₦)"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
            <select
              name="priority"
              defaultValue="Medium"
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Add to Wish List
          </button>
        </form>
      </section>
    </div>
  );
}
