import Link from "next/link";
import { Home, ArrowLeftRight, PlusCircle, Target, Menu, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/data/ensure-profile";
import { ConnectionBanner } from "./connection-banner";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/more", label: "More", icon: Menu },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let unreadCount = 0;
  if (user) {
    await ensureProfile(supabase, user);
    const { count } = await supabase
      .from("in_app_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <div className="min-h-dvh pb-20 md:flex md:pb-0">
      <ConnectionBanner />

      {/* Desktop sidebar — same nav items as mobile, laid out vertically. */}
      <nav className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-56 md:shrink-0 md:flex-col md:border-r md:border-ink/10 md:bg-white md:py-6">
        <p className="px-6 text-lg font-semibold text-ink">StewardOS</p>
        <div className="mt-8 flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5 hover:text-ink"
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <header className="mx-auto flex max-w-lg items-center justify-end px-4 pt-4 md:max-w-5xl md:px-8">
          <Link href="/notifications" className="tap-target relative flex items-center justify-center">
            <Bell className="h-6 w-6 text-ink/60" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>
        <div className="mx-auto max-w-lg px-4 md:max-w-5xl md:px-8">{children}</div>
      </div>

      {/* Mobile bottom nav — replaced by the sidebar at md and up. */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-ink/60 active:text-accent"
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
