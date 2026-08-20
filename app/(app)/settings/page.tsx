import Link from "next/link";
import { ChevronUp, ChevronDown, Trash2, User, ShieldAlert, Sliders, Bell, CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateNotificationPrefs } from "@/lib/actions/misc";
import { createBucket, updateBucket, toggleBucketActive, moveBucket, deleteBucket } from "@/lib/actions/buckets";
import { PushSubscribeButton } from "../notifications/push-subscribe-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const currentTab = params.tab || "profile";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: buckets }, { data: accounts }, { data: profile }] = await Promise.all([
    supabase.from("budget_buckets").select("*").eq("user_id", user?.id).order("sort_order"),
    supabase.from("accounts").select("id, name").eq("user_id", user?.id).order("name"),
    supabase.from("profiles").select("*").eq("id", user?.id).maybeSingle(),
  ]);

  const splitTotal = (buckets ?? [])
    .filter((b) => b.is_income_split && b.is_active)
    .reduce((s, b) => s + Number(b.target_percent), 0);

  const userName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "MA";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">System Settings</h1>
        <p className="text-xs text-zinc-500">
          Manage your personal profile, allocation buckets, and security settings.
        </p>
      </div>

      {/* Main 2-Column Layout matching Figma desktop-settings-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sub-navigation Bar (3/12 cols) */}
        <div className="lg:col-span-3">
          <nav className="space-y-1 rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm">
            {[
              { id: "profile", label: "Personal Profile", icon: User },
              { id: "buckets", label: "Allocation Buckets", icon: Sliders },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "accounts", label: "Linked Accounts", icon: CreditCard },
              { id: "security", label: "Delete Account", icon: ShieldAlert, danger: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/settings?tab=${tab.id}`}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-600 shadow-xs"
                      : tab.danger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Content Panel (9/12 cols) */}
        <div className="space-y-6 lg:col-span-9">
          {/* TAB 1: Profile */}
          {currentTab === "profile" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Personal Profile</h2>
                  <p className="text-xs text-zinc-400">
                    Primary identity and currency defaults across your StewardOS workspace.
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
                  Personal Account
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 font-extrabold text-white text-base">
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{userName}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue={userName}
                    disabled
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Workspace Currency</label>
                  <input
                    type="text"
                    defaultValue="NGN (₦) — Nigerian Naira"
                    disabled
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Timezone</label>
                  <input
                    type="text"
                    defaultValue="West Africa Time (GMT+1)"
                    disabled
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Allocation Buckets */}
          {(currentTab === "buckets" || currentTab === "profile") && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Allocation Buckets Structure</h2>
                  <p className="text-xs text-zinc-400">
                    Customize names, percentages, order, and funding accounts.
                  </p>
                </div>
                {splitTotal !== 100 ? (
                  <Badge tone="warning">Income Split: {splitTotal}%</Badge>
                ) : (
                  <Badge tone="success">100% Allocated</Badge>
                )}
              </div>

              <div className="space-y-3">
                {(buckets ?? []).map((b, i) => (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3.5 shadow-xs transition-all ${
                      b.is_active ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50/70 opacity-60"
                    }`}
                  >
                    <form action={updateBucket} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        type="text"
                        name="name"
                        defaultValue={b.name}
                        className="tap-target min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:border-brand-500 focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          name="target_percent"
                          defaultValue={b.target_percent}
                          step="0.1"
                          disabled={!b.is_income_split}
                          className="tap-target w-16 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-center focus:border-brand-500 focus:outline-none disabled:bg-zinc-100"
                        />
                        <span className="text-xs text-zinc-400 font-bold">%</span>
                      </div>
                      <select
                        name="default_account_id"
                        defaultValue={b.default_account_id ?? ""}
                        className="tap-target rounded-lg border border-zinc-200 bg-white px-2 text-xs focus:border-brand-500 focus:outline-none"
                      >
                        <option value="">No default account</option>
                        {(accounts ?? []).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
                        Save
                      </Button>
                    </form>

                    <div className="mt-2.5 flex items-center gap-1 pt-2 border-t border-zinc-100">
                      <form action={moveBucket}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="tap-target flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveBucket}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === (buckets ?? []).length - 1}
                          className="tap-target flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={toggleBucketActive} className="ml-auto">
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="is_active" value={(!b.is_active).toString()} />
                        <button
                          type="submit"
                          className="tap-target text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                        >
                          {b.is_active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteBucket} className="ml-2">
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          className="tap-target flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-rose-600"
                          aria-label="Delete bucket"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Bucket Form */}
              <div className="pt-2">
                <form action={createBucket} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="New Bucket Name"
                    required
                    className="tap-target min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="target_percent"
                    placeholder="%"
                    step="0.1"
                    min="0"
                    max="100"
                    defaultValue="10"
                    className="tap-target w-16 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-center focus:border-brand-500 focus:outline-none"
                  />
                  <Button type="submit" variant="primary" className="px-3.5 py-1.5 text-xs">
                    + Add Bucket
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {(currentTab === "notifications" || currentTab === "profile") && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-zinc-900">Notification Preferences</h2>
              <PushSubscribeButton />
            </div>
          )}

          {/* TAB 4: Delete Account */}
          {(currentTab === "security" || currentTab === "profile") && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Danger Zone
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Permanently remove your account, transactions, allocations, and financial history.
              </p>
              <Link
                href="/settings/delete-account"
                className="tap-target inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700"
              >
                Proceed to Delete Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
