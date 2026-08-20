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
  PlusCircle,
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/transactions": ArrowLeftRight,
  "/goals": Target,
  "/reports": BarChart3,
  "/monthly-review": CalendarCheck,
  "/allocations": PieChart,
  "/settings": Settings,
  "/bills": Receipt,
  "/subscriptions": RefreshCw,
  "/insights": Sparkles,
  "/celebrations": Sparkles,
  "/journal": BookOpen,
  "/add": PlusCircle,
  "/more": Menu,
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

  return (
    <Link
      href={href}
      className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-fast ${
        active ? "text-brand-500 font-semibold" : "text-zinc-400 font-normal"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}
