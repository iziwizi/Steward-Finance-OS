import Link from "next/link";
import { User, Sliders, Bell, CreditCard, ShieldAlert, BookOpen, Heart, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { BucketManager } from "./bucket-manager";
import { LinkedAccountsManager } from "./linked-accounts";
import { PushSubscribeButton } from "../notifications/push-subscribe-button";
import { SettingsInstructions } from "@/components/settings-instructions";

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
    avatar_url: profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || null,
  };

  const accountList = accounts ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">System Settings</h1>
        <p className="text-xs text-zinc-500">
          Manage your personal profile, financial buckets, linked accounts, and security settings.
        </p>
      </div>

      {/* Main 2-Column Layout matching Figma desktop-settings-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sub-navigation Bar (3/12 cols) */}
        <div className="lg:col-span-3">
          <nav className="space-y-1 rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "accounts", label: "Linked Accounts", icon: CreditCard },
              { id: "allocations", label: "Allocation Percentages", icon: Sliders },
              { id: "instructions", label: "Instructions & Guide", icon: BookOpen },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Security & Deletion", icon: ShieldAlert, danger: true },
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
        <div className="lg:col-span-9">
          {/* TAB 1: Profile (Canonical Home for Personal Profile ONLY) */}
          {currentTab === "profile" && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <ProfileForm profile={resolvedProfile} userEmail={user?.email || ""} />
            </div>
          )}

          {/* TAB 2: Accounts (Canonical Home for Linked Accounts) */}
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

          {/* TAB 6: Security / Delete Account (Canonical Home for Danger Zone) */}
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
        </div>
      </div>
    </div>
  );
}
