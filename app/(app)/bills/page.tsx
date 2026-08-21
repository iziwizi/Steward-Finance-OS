import { createClient } from "@/lib/supabase/server";
import { BillsManager } from "./bills-manager";

export default async function BillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bills }, { data: accounts }] = await Promise.all([
    supabase.from("bills").select("*").eq("user_id", user?.id).order("next_due"),
    supabase.from("accounts").select("id, name").eq("user_id", user?.id).order("name"),
  ]);

  return <BillsManager bills={bills ?? []} accounts={accounts ?? []} />;
}
