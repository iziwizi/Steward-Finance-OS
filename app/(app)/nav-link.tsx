"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, PlusCircle, Target, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icons resolved here, client-side, keyed by href — never passed in as a
// prop from the server layout. A React component reference is a function,
// and Server Components cannot serialize a function into a Client
// Component's props (only plain data can cross that boundary); doing so
// throws "Functions cannot be passed directly to Client Components" and
// crashes the whole route on every render.
const ICONS: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/transactions": ArrowLeftRight,
  "/add": PlusCircle,
  "/goals": Target,
  "/more": Menu,
};

export function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const Icon = ICONS[href];

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-fast ${
        active ? "bg-brand-50 font-semibold text-brand-500" : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
      }`}
    >
      {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
      {label}
    </Link>
  );
}

export function BottomNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const Icon = ICONS[href];

  return (
    <Link
      href={href}
      className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-fast ${
        active ? "text-brand-500" : "text-zinc-400"
      }`}
    >
      {Icon && <Icon className="h-6 w-6" strokeWidth={1.75} />}
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
