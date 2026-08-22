import { createClient } from "@/lib/supabase/server";
import { IncomeForm } from "./income-form";
import { MobilePageHeader } from "@/components/mobile-page-header";

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
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Record Income" fallbackHref="/dashboard" />

      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Record Income</h1>
        <p className="text-xs text-zinc-500">
          Inflows are automatically split across your designated budget envelopes with integer kobo precision.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs">
        <IncomeForm accounts={accounts ?? []} />
      </div>
    </div>
  );
}
