import { createClient } from "@/lib/supabase/server";
import { WishlistManager } from "./wishlist-manager";

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

  return <WishlistManager items={items ?? []} />;
}
