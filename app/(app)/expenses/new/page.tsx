import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function NewExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: accounts }, { data: buckets }] = await Promise.all([
    supabase.from("accounts").select("id, name").eq("user_id", user!.id).order("name"),
    supabase
      .from("budget_buckets")
      .select("id, name")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Log Expense" fallbackHref="/dashboard" />

      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Log Expense</h1>
        <p className="text-xs text-zinc-500">
          Record your daily disbursements and assign outflows to their respective budget envelopes.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-7 shadow-xs">
        <ExpenseForm accounts={accounts ?? []} buckets={buckets ?? []} />
      </div>
    </div>
  );
}
