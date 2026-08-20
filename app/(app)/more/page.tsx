import Link from "next/link";
import {
  Receipt,
  RefreshCw,
  Gem,
  Heart,
  BookOpen,
  CalendarCheck,
  ListTodo,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const ITEMS = [
  { href: "/today", label: "Today's Decisions", icon: ListTodo, desc: "Quick daily financial checklist" },
  { href: "/celebrations", label: "Celebration Center", icon: Sparkles, desc: "Milestones and financial wins" },
  { href: "/reports", label: "Reports", icon: BarChart3, desc: "Cash flow & allocation breakdown" },
  { href: "/monthly-review", label: "Monthly Review", icon: CalendarCheck, desc: "End of month summary" },
  { href: "/bills", label: "Bills", icon: Receipt, desc: "Manage recurring bills & due dates" },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw, desc: "Active recurring subscriptions" },
  { href: "/assets", label: "Assets", icon: Gem, desc: "Track property & high value assets" },
  { href: "/wishlist", label: "Wish List", icon: Heart, desc: "Future purchases & savings list" },
  { href: "/journal", label: "Financial Journal", icon: BookOpen, desc: "Notes on financial decisions" },
  { href: "/settings", label: "Settings", icon: Settings, desc: "Buckets, profile & app preferences" },
];

export default function MorePage() {
  return (
    <div className="space-y-5 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Navigation</p>
        <h1 className="text-display-md text-zinc-900">More</h1>
      </div>
      <div className="space-y-2">
        {ITEMS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="tap-target flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-400">{desc}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
