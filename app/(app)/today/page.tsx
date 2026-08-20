import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { CheckCircle2, AlertTriangle, Calendar } from "lucide-react";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: pendingAllocs }, { data: bills }, { data: profile }] = await Promise.all([
    supabase
      .from("allocations")
      .select("id, planned_amount, budget_buckets(name)")
      .eq("user_id", user?.id)
      .eq("status", "pending"),
    supabase
      .from("bills")
      .select("*")
      .eq("user_id", user?.id)
      .eq("status", "active")
      .order("next_due"),
    supabase.from("profiles").select("reminder_days_before_bill").eq("id", user?.id).maybeSingle(),
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
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Daily Focus</p>
        <h1 className="text-display-md text-zinc-900">Today's Decisions</h1>
      </div>

      <div className="space-y-3">
        {titheAlloc && (
          <Link
            href="/transactions"
            className="tap-target block rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 shadow-sm transition-all hover:bg-amber-50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              Tithe is pending
            </div>
            <p className="mt-1 text-xs text-zinc-600">
              {formatNaira(Number(titheAlloc.planned_amount))} — send it to church/ministry and mark it complete →
            </p>
          </Link>
        )}

        {otherPending.length > 0 && (
          <Link
            href="/transactions"
            className="tap-target block rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.99]"
          >
            <p className="text-sm font-bold text-zinc-900">{otherPending.length} other allocation(s) pending</p>
            <p className="mt-1 text-xs text-zinc-500">Review committed bucket transfers and mark what's been sent →</p>
          </Link>
        )}

        {upcomingBills.length > 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-600" />
              Bills due in the next {reminderDays} days
            </h2>
            <div className="divide-y divide-zinc-100">
              {upcomingBills.map((b) => (
                <div key={b.id} className="flex justify-between items-center py-2 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900">{b.name}</span>
                    <span className="text-zinc-400 block text-[11px]">Due {b.next_due}</span>
                  </div>
                  <span className="font-bold text-zinc-900">{formatNaira(Number(b.amount))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!titheAlloc && otherPending.length === 0 && upcomingBills.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-bold text-zinc-900">All caught up!</p>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              No pending allocations or urgent bills due today. You are fully in stewardship rhythm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
