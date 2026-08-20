import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/data/ensure-profile";
import { ConnectionBanner } from "./connection-banner";
import { SidebarLink, BottomNavLink } from "./nav-link";
import { Logo } from "@/components/logo";

// href/label only — plain strings are the only thing this Server Component
// may hand to the client SidebarLink/BottomNavLink below. Icons are resolved
// inside nav-link.tsx itself; see the comment there for why.
const NAV = [
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
    supabase.from("profiles").select("onboarding_completed_at").eq("id", user.id).maybeSingle(),
  ]);
  const unreadCount = count ?? 0;
  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/welcome");
  }

  return (
    <div className="min-h-dvh bg-paper pb-20 md:flex md:pb-0">
      <ConnectionBanner />

      {/* Desktop sidebar — same nav items as mobile, laid out vertically. */}
      <nav className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-zinc-200 md:bg-white md:py-6">
        <div className="px-5">
          <Logo />
        </div>
        <div className="mt-8 flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <header className="mx-auto flex max-w-lg items-center justify-end px-4 pt-4 md:max-w-5xl md:px-8">
          <Link href="/notifications" className="tap-target relative flex items-center justify-center">
            <Bell className="h-6 w-6 text-zinc-500" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-expense text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>
        <div className="mx-auto max-w-lg px-4 md:max-w-5xl md:px-8">{children}</div>
      </div>

      {/* Mobile bottom nav — replaced by the sidebar at md and up. */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {NAV.map((item) => (
            <BottomNavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
