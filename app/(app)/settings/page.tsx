import Link from "next/link";
import { User, Sliders, Bell, CreditCard, ShieldAlert, BookOpen, Heart, Download, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "@/lib/actions/auth";
import { ProfileForm } from "./profile-form";
import { BucketManager } from "./bucket-manager";
import { LinkedAccountsManager } from "./linked-accounts";
import { PushSubscribeButton } from "../notifications/push-subscribe-button";
import { SettingsInstructions } from "@/components/settings-instructions";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { SettingsNav } from "./settings-nav";

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

  const [{ data: profile }, { data: buckets }, { data: accounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id).maybeSingle(),
    supabase.from("budget_buckets").select("*").eq("user_id", user?.id).order("sort_order"),
    supabase.from("accounts").select("id, name, institution, is_active").eq("user_id", user?.id).order("name"),
  ]);

  const resolvedProfile = {
    ...profile,
    avatar_url: profile?.avatar_url || null,
  };

  const accountList = accounts ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Settings" fallbackHref="/dashboard" />

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">System Settings</h1>
        <p className="text-xs text-zinc-500">
          Manage your personal profile, financial buckets, linked accounts, and security settings.
        </p>
      </div>

      {/* Main 2-Column Layout matching Figma desktop-settings-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sub-navigation Bar (3/12 cols) with Instant Feedback */}
        <div className="lg:col-span-3">
          <SettingsNav currentTab={currentTab} />
        </div>

        {/* Right Content Panel (9/12 cols) */}
        <div className="lg:col-span-9">
          {/* TAB 1: Profile (Canonical Home for Personal Profile ONLY) */}
          {currentTab === "profile" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <ProfileForm profile={resolvedProfile} userEmail={user?.email || ""} />
            </div>
          )}

          {/* TAB 2: Account (Canonical Home for Linked Accounts) */}
          {currentTab === "accounts" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <LinkedAccountsManager accounts={accountList} />
            </div>
          )}

          {/* TAB 3: Allocation Percentages (Canonical Home for Buckets Editor) */}
          {currentTab === "allocations" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <BucketManager buckets={buckets ?? []} accounts={accountList} />
            </div>
          )}

          {/* TAB 4: Instructions & Guide */}
          {currentTab === "instructions" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <SettingsInstructions />
            </div>
          )}

          {/* TAB 5: Notifications (Canonical Home for Notification Settings) */}
          {currentTab === "notifications" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-sm font-bold text-zinc-900">Notification Settings</h2>
                <p className="text-xs text-zinc-400">
                  Configure real-time device push notifications and milestone reminders.
                </p>
              </div>
              <PushSubscribeButton />
            </div>
          )}

          {/* TAB 6: Security & Deletion (Canonical Home for Danger Zone) */}
          {currentTab === "security" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm space-y-4">
              <div className="border-b border-rose-200/60 pb-3">
                <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Danger Zone: Permanent Account Deletion
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Once you delete your account, there is no going back. All transactions, goals, allocations, and journal notes will be permanently removed.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/settings/delete-account"
                  className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700"
                >
                  Proceed to Delete Account
                </Link>
              </div>
            </div>
          )}

          {/* TAB 7: Log Out of StewardOS (Dedicated Navigation Item) */}
          {currentTab === "logout" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-zinc-700" />
                  <span>Log Out of StewardOS</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  End your active session on this device. You can log back in at any time with your email and password.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50/80 p-4 border border-zinc-100 space-y-2">
                <p className="text-xs text-zinc-700 font-medium">
                  Signed in as: <strong>{user?.email}</strong>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Your offline cached data and preferences remain secure on your device.
                </p>
              </div>

              <form action={logOut} className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Confirm Log Out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
