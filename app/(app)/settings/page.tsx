import { createClient } from "@/lib/supabase/server";
import { updateBucket, updateNotificationPrefs } from "@/lib/actions/misc";
import { importStewardOsSeedData } from "@/lib/actions/migration";
import { PushSubscribeButton } from "../notifications/push-subscribe-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: buckets }, { data: accounts }, { data: profile }, { data: incomeCount }] =
    await Promise.all([
      supabase.from("budget_buckets").select("*").eq("user_id", user!.id).order("sort_order"),
      supabase.from("accounts").select("id, name").eq("user_id", user!.id).order("name"),
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase
        .from("income_transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  const splitTotal = (buckets ?? [])
    .filter((b) => b.is_income_split)
    .reduce((s, b) => s + Number(b.target_percent), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Buckets</h2>
        <p className="mt-1 text-xs text-ink/50">
          Income-split total: {splitTotal}%{" "}
          {splitTotal !== 100 && <span className="text-danger">(should total 100%)</span>}
        </p>
        <div className="mt-3 space-y-3">
          {(buckets ?? []).map((b) => (
            <form key={b.id} action={updateBucket} className="flex items-center gap-2">
              <input type="hidden" name="id" value={b.id} />
              <span className="flex-1 text-sm">{b.name}</span>
              <input
                type="number"
                name="target_percent"
                defaultValue={b.target_percent}
                step="0.1"
                disabled={!b.is_income_split}
                className="tap-target w-20 rounded-xl border border-ink/15 px-2 text-sm disabled:bg-ink/5"
              />
              <select
                name="default_account_id"
                defaultValue={b.default_account_id ?? ""}
                className="tap-target rounded-xl border border-ink/15 px-2 text-sm"
              >
                {(accounts ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button className="tap-target rounded-xl bg-accent/10 px-3 text-xs font-medium text-accent">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Notifications</h2>
        <form action={updateNotificationPrefs} className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-ink/60">Notification email</span>
            <input
              name="notification_email"
              type="email"
              defaultValue={profile?.notification_email ?? ""}
              className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs text-ink/60">Bill reminder (days before)</span>
              <input
                name="reminder_days_before_bill"
                type="number"
                defaultValue={profile?.reminder_days_before_bill ?? 3}
                className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-xs text-ink/60">Subscription reminder (days before)</span>
              <input
                name="reminder_days_before_subscription"
                type="number"
                defaultValue={profile?.reminder_days_before_subscription ?? 3}
                className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
              />
            </label>
          </div>
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Save Notification Settings
          </button>
        </form>
        <div className="mt-3">
          <PushSubscribeButton />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Daily brief 7:00am, weekly report Sundays, monthly report on the 1st — all Africa/Lagos
          time, sent by email and, if enabled above, as a push notification on this device.
        </p>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">Export Your Data</h2>
        <p className="mt-1 text-xs text-ink/60">
          Download everything StewardOS has on you. Always scoped to your account only.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="/api/export?format=json&type=all"
            className="tap-target rounded-xl border border-ink/15 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Full export (JSON)
          </a>
          <a
            href="/api/export?format=csv&type=all"
            className="tap-target rounded-xl border border-ink/15 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Full export (CSV)
          </a>
          <a
            href="/api/export?format=csv&type=income"
            className="tap-target rounded-xl border border-ink/15 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Income only (CSV)
          </a>
          <a
            href="/api/export?format=csv&type=expenses"
            className="tap-target rounded-xl border border-ink/15 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Expenses only (CSV)
          </a>
        </div>
      </section>

      {(incomeCount as any)?.count === 0 || !incomeCount ? (
        <section className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
          <h2 className="text-sm font-semibold text-ink/70">Import StewardOS Data</h2>
          <p className="mt-1 text-xs text-ink/60">
            One-time import of your real historical transactions from the original spreadsheet.
            Safe to run more than once — already-imported records are skipped.
          </p>
          <form
            action={async () => {
              "use server";
              await importStewardOsSeedData();
            }}
            className="mt-3"
          >
            <button className="tap-target w-full rounded-xl bg-gold font-medium text-white">
              Import my StewardOS data
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
