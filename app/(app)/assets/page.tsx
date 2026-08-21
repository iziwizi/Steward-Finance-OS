import { createClient } from "@/lib/supabase/server";
import { AssetManager } from "./asset-manager";

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

  return <AssetManager assets={assets ?? []} />;
}
