"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-fast ${
        active ? "bg-brand-50 font-semibold text-brand-500" : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

export function BottomNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-fast ${
        active ? "text-brand-500" : "text-zinc-400"
      }`}
    >
      <Icon className="h-6 w-6" strokeWidth={1.75} />
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
