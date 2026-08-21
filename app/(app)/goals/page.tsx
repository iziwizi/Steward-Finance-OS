import { createClient } from "@/lib/supabase/server";
import { GoalsList } from "./goals-list";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user?.id)
    .order("status")
    .order("target_date");

  return <GoalsList goals={goals ?? []} />;
}
