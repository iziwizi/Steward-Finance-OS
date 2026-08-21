"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart3,
  CalendarCheck,
  PieChart,
  Receipt,
  RefreshCw,
  Sparkles,
  BookOpen,
  Settings,
  Plus,
  Menu,
  MoreHorizontal,
  Home,
  List,
  Landmark,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/transactions": List,
  "/goals": Target,
  "/reports": BarChart3,
  "/monthly-review": CalendarCheck,
  "/allocations": PieChart,
  "/settings": Settings,
  "/bills": Receipt,
  "/subscriptions": RefreshCw,
  "/assets": Landmark,
  "/wishlist": Heart,
  "/insights": Sparkles,
  "/celebrations": Sparkles,
  "/journal": BookOpen,
  "/add": Plus,
  "/more": MoreHorizontal,
};

export function SidebarLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: string | number;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const Icon = ICONS[href] || LayoutDashboard;

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-fast ${
        active
          ? "bg-brand-50 text-brand-600 shadow-sm"
          : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          className={`h-4 w-4 transition-colors ${
            active ? "text-brand-600" : "text-zinc-400 group-hover:text-zinc-700"
          }`}
          strokeWidth={1.8}
        />
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            active ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function BottomNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const Icon = ICONS[href] || LayoutDashboard;

  // Middle Add Button rendered as dark teal circular FAB matching Figma Mobile
  if (href === "/add") {
    return (
      <Link
        href="/add"
        aria-label="Add transaction"
        className="flex flex-1 items-center justify-center -translate-y-2"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-transform active:scale-90 hover:bg-brand-600">
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-fast ${
        active ? "text-brand-600 font-semibold" : "text-zinc-400 font-normal hover:text-zinc-600"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
