import Link from "next/link";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateNotificationPrefs } from "@/lib/actions/misc";
import { createBucket, updateBucket, toggleBucketActive, moveBucket, deleteBucket } from "@/lib/actions/buckets";
import { PushSubscribeButton } from "../notifications/push-subscribe-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: buckets }, { data: accounts }, { data: profile }] = await Promise.all([
    supabase.from("budget_buckets").select("*").eq("user_id", user!.id).order("sort_order"),
    supabase.from("accounts").select("id, name").eq("user_id", user!.id).order("name"),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  const splitTotal = (buckets ?? [])
    .filter((b) => b.is_income_split && b.is_active)
    .reduce((s, b) => s + Number(b.target_percent), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Allocation Buckets</h2>
          {splitTotal !== 100 && (
            <Badge tone="warning">Income split totals {splitTotal}%</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Your own allocation structure — rename, reorder, disable, or add buckets. Nothing here
          is fixed; these are starter defaults you fully control.
        </p>
        <div className="mt-3 space-y-2">
          {(buckets ?? []).map((b, i) => (
            <div
              key={b.id}
              className={`rounded-md border border-zinc-200 p-3 ${b.is_active ? "bg-white" : "bg-zinc-50 opacity-60"}`}
            >
              <form action={updateBucket} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={b.id} />
                <input
                  type="text"
                  name="name"
                  defaultValue={b.name}
                  className="tap-target min-w-0 flex-1 rounded-md border border-zinc-200 px-2 text-sm"
                />
                <input
                  type="number"
                  name="target_percent"
                  defaultValue={b.target_percent}
                  step="0.1"
                  disabled={!b.is_income_split}
                  className="tap-target w-20 rounded-md border border-zinc-200 px-2 text-sm disabled:bg-zinc-100"
                />
                <select
                  name="default_account_id"
                  defaultValue={b.default_account_id ?? ""}
                  className="tap-target rounded-md border border-zinc-200 px-2 text-sm"
                >
                  <option value="">No default account</option>
                  {(accounts ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
                  Save
                </Button>
              </form>
              <div className="mt-2 flex items-center gap-1">
                <form action={moveBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="tap-target flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={moveBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === (buckets ?? []).length - 1}
                    className="tap-target flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </form>
                <form action={toggleBucketActive} className="ml-auto">
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="is_active" value={(!b.is_active).toString()} />
                  <button
                    type="submit"
                    className="tap-target rounded-md px-2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
                  >
                    {b.is_active ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={deleteBucket}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="tap-target flex items-center justify-center rounded-md text-zinc-400 hover:text-red-600"
                    aria-label="Delete bucket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={createBucket} className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
          <p className="text-xs font-semibold text-zinc-500">Add a bucket</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="name"
              placeholder="Bucket name"
              required
              className="tap-target min-w-0 flex-1 rounded-md border border-zinc-200 px-2 text-sm"
            />
            <input
              type="number"
              name="target_percent"
              placeholder="%"
              step="0.1"
              defaultValue={0}
              className="tap-target w-20 rounded-md border border-zinc-200 px-2 text-sm"
            />
            <label className="flex items-center gap-1.5 text-xs text-zinc-600">
              <input type="checkbox" name="is_income_split" defaultChecked className="h-4 w-4" />
              Income split
            </label>
            <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs">
              Add
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-700">Notifications</h2>
        <form action={updateNotificationPrefs} className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-600">Notification email</span>
            <input
              name="notification_email"
              type="email"
              defaultValue={profile?.notification_email ?? ""}
              className="tap-target w-full rounded-md border border-zinc-200 px-3 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs text-zinc-600">Bill reminder (days before)</span>
              <input
                name="reminder_days_before_bill"
                type="number"
                defaultValue={profile?.reminder_days_before_bill ?? 3}
                className="tap-target w-full rounded-md border border-zinc-200 px-3 text-sm"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-xs text-zinc-600">Subscription reminder (days before)</span>
              <input
                name="reminder_days_before_subscription"
                type="number"
                defaultValue={profile?.reminder_days_before_subscription ?? 3}
                className="tap-target w-full rounded-md border border-zinc-200 px-3 text-sm"
              />
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save Notification Settings
          </Button>
        </form>
        <div className="mt-3">
          <PushSubscribeButton />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Daily brief 7:00am, weekly report Sundays, monthly report on the 1st — all in your
          account's timezone, sent by email and, if enabled above, as a push notification on this
          device.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-700">App</h2>
        <Link
          href="/install"
          className="tap-target mt-3 flex w-full items-center justify-center rounded-md border border-zinc-200 text-sm font-medium text-zinc-900"
        >
          Install StewardOS
        </Link>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-700">Export Your Data</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Download everything StewardOS has on you. Always scoped to your account only.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="/api/export?format=json&type=all"
            className="tap-target rounded-md border border-zinc-200 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Full export (JSON)
          </a>
          <a
            href="/api/export?format=csv&type=all"
            className="tap-target rounded-md border border-zinc-200 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Full export (CSV)
          </a>
          <a
            href="/api/export?format=csv&type=income"
            className="tap-target rounded-md border border-zinc-200 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Income only (CSV)
          </a>
          <a
            href="/api/export?format=csv&type=expenses"
            className="tap-target rounded-md border border-zinc-200 bg-white text-center text-sm font-medium leading-[44px]"
          >
            Expenses only (CSV)
          </a>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Permanently delete your account and all associated data.
        </p>
        <Link
          href="/settings/delete-account"
          className="tap-target mt-3 flex w-full items-center justify-center rounded-md border border-red-200 text-sm font-semibold text-red-700"
        >
          Delete Account
        </Link>
      </section>
    </div>
  );
}
