import Link from "next/link";
import { Home, ArrowLeftRight, PlusCircle, Target, Menu, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
    const { count } = await supabase
      .from("in_app_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <div className="min-h-dvh pb-20">
      <ConnectionBanner />
      <header className="mx-auto flex max-w-lg items-center justify-end px-4 pt-4">
        <Link href="/notifications" className="tap-target relative flex items-center justify-center">
          <Bell className="h-6 w-6 text-ink/60" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </header>
      <div className="mx-auto max-w-lg px-4">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-white/95 backdrop-blur">
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
