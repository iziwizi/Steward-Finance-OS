import { createClient } from "@/lib/supabase/server";
import { NotificationsView } from "./notifications-view";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("in_app_notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <NotificationsView notifications={notifications ?? []} />;
}
