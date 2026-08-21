import { createClient } from "@/lib/supabase/server";
import { IncomeForm } from "./income-form";

export default async function NewIncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Record Income</h1>
        <p className="text-xs text-zinc-500">
          Inflows are automatically split across your designated budget envelopes with integer kobo precision.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-6 shadow-xs">
        <IncomeForm accounts={accounts ?? []} />
      </div>
    </div>
  );
}
