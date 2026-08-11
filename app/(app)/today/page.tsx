import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: pendingAllocs }, { data: bills }, { data: profile }] = await Promise.all([
    supabase
      .from("allocations")
      .select("id, planned_amount, budget_buckets(name)")
      .eq("user_id", user!.id)
      .eq("status", "pending"),
    supabase
      .from("bills")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .order("next_due"),
    supabase.from("profiles").select("reminder_days_before_bill").eq("id", user!.id).single(),
  ]);

  const reminderDays = profile?.reminder_days_before_bill ?? 3;
  const today = new Date();
  const upcomingBills = (bills ?? []).filter((b) => {
    if (!b.next_due) return false;
    const days = Math.ceil((new Date(b.next_due).getTime() - today.getTime()) / 86400000);
    return days <= reminderDays;
  });

  const titheAlloc = (pendingAllocs ?? []).find((a: any) => a.budget_buckets?.name === "Tithe");
  const otherPending = (pendingAllocs ?? []).filter((a: any) => a.budget_buckets?.name !== "Tithe");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today's Decisions</h1>

      {titheAlloc && (
        <Link
          href="/transactions"
          className="tap-target block rounded-2xl border border-gold/30 bg-gold/5 p-4"
        >
          <p className="font-medium text-gold">Tithe is pending</p>
          <p className="text-sm text-ink/60">
            {formatNaira(Number(titheAlloc.planned_amount))} — send it and mark it here →
          </p>
        </Link>
      )}

      {otherPending.length > 0 && (
        <Link
          href="/transactions"
          className="tap-target block rounded-2xl border border-ink/10 bg-white p-4"
        >
          <p className="font-medium">{otherPending.length} other allocation(s) pending</p>
          <p className="text-sm text-ink/60">Review and mark what's been sent →</p>
        </Link>
      )}

      {upcomingBills.length > 0 && (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4">
          <p className="font-medium text-danger">Bills due soon</p>
          <ul className="mt-1 text-sm text-ink/70">
            {upcomingBills.map((b) => (
              <li key={b.id}>
                {b.name} — {formatNaira(Number(b.amount))} due {b.next_due}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/income/new"
          className="tap-target rounded-2xl border border-ink/10 bg-white p-4 text-center font-medium"
        >
          Record Income
        </Link>
        <Link
          href="/expenses/new"
          className="tap-target rounded-2xl border border-ink/10 bg-white p-4 text-center font-medium"
        >
          Log Expense
        </Link>
      </div>

      {!titheAlloc && otherPending.length === 0 && upcomingBills.length === 0 && (
        <p className="text-sm text-ink/50">Nothing urgent — you're on top of things.</p>
      )}
    </div>
  );
}
