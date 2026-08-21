import { createClient } from "@/lib/supabase/server";
import { SubscriptionsManager } from "./subscriptions-manager";

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

  return <SubscriptionsManager subs={subs ?? []} />;
}
