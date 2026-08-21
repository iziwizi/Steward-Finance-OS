import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, LogOut, Settings as SettingsIcon, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/data/ensure-profile";
import { ConnectionBanner } from "./connection-banner";
import { SidebarLink, BottomNavLink } from "./nav-link";
import { Logo } from "@/components/logo";
import { logOut } from "@/lib/actions/auth";
import { GlobalSearch } from "@/components/global-search";
import { MobileSearchModal } from "@/components/mobile-search-modal";
import { MobileProfileMenu } from "@/components/mobile-profile-menu";

const DESKTOP_NAV_MAIN = [
  { href: "/dashboard", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/goals", label: "Goals" },
  { href: "/reports", label: "Reports" },
  { href: "/monthly-review", label: "Monthly Review" },
];

const DESKTOP_NAV_PLANNING = [
  { href: "/allocations", label: "Allocations" },
  { href: "/bills", label: "Bills" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/assets", label: "Assets" },
  { href: "/wishlist", label: "Wishlist" },
];

const DESKTOP_NAV_INSIGHTS = [
  { href: "/celebrations", label: "Insights & Celebrations" },
  { href: "/journal", label: "Financial Journal" },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/transactions", label: "Transactions" },
  { href: "/add", label: "Add" },
  { href: "/goals", label: "Goals" },
  { href: "/more", label: "More" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(supabase, user);
  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("in_app_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  const unreadCount = count ?? 0;
  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/welcome");
  }

  const userName = profile?.full_name || (user.user_metadata as any)?.full_name || user.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "MA";
  const avatarUrl = profile?.avatar_url || null;

  return (
    <div className="min-h-dvh bg-paper pb-20 md:flex md:pb-0">
      <ConnectionBanner />

      {/* Figma Desktop Sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:flex-col md:border-r md:border-zinc-200/80 md:bg-white md:px-4 md:py-4">
        {/* Top Full Logo */}
        <div className="flex items-center justify-between px-1 pb-4 shrink-0 border-b border-zinc-100/80">
          <Link href="/dashboard" className="inline-block">
            <Logo variant="full" />
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-3 pr-1">
          <nav className="space-y-1">
            {DESKTOP_NAV_MAIN.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Planning
            </p>
            {DESKTOP_NAV_PLANNING.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Insights
            </p>
            {DESKTOP_NAV_INSIGHTS.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* User Card & Branding at bottom of sidebar - firmly anchored & visible */}
        <div className="shrink-0 space-y-2.5 pt-3 border-t border-zinc-100">
          <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 font-bold text-white text-xs">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-zinc-900">{userName}</p>
                  <p className="text-[10px] font-medium text-zinc-400">Personal Account</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Link
                  href="/settings?tab=profile"
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                  title="Settings"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                </Link>
                <form action={logOut}>
                  <button
                    type="submit"
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-rose-600 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* MUJTEKNIFY Product Attribution */}
          <div className="px-2 text-center pb-1">
            <a
              href="https://mujteknify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-brand-600 transition-colors"
            >
              <span>A Product of MUJTEKNIFY · © 2026</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between border-b border-zinc-200/70 bg-white/80 px-8 py-3.5 backdrop-blur">
          <GlobalSearch />

          <div className="flex items-center gap-4">
            <Link
              href="/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              New Transaction
            </Link>

            <Link href="/notifications" className="relative flex items-center justify-center p-1">
              <Bell className="h-5 w-5 text-zinc-500 hover:text-zinc-800 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-expense px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Sticky Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
            <Link href="/dashboard" className="shrink-0">
              <Logo variant="full" />
            </Link>
            <div className="flex items-center gap-2">
              <MobileSearchModal />
              <Link href="/notifications" className="tap-target relative flex items-center justify-center p-1">
                <Bell className="h-5 w-5 text-zinc-600" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-expense px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <MobileProfileMenu
                avatarUrl={avatarUrl}
                userName={userName}
                userInitials={userInitials}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pt-4 md:max-w-7xl md:px-8 md:pt-6">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden z-40">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {MOBILE_NAV.map((item) => (
            <BottomNavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
