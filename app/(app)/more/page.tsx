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
} from "lucide-react";

const ITEMS = [
  { href: "/today", label: "Today's Decisions", icon: ListTodo },
  { href: "/celebrations", label: "Celebration Center", icon: Sparkles },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/monthly-review", label: "Monthly Review", icon: CalendarCheck },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/assets", label: "Assets", icon: Gem },
  { href: "/wishlist", label: "Wish List", icon: Heart },
  { href: "/journal", label: "Financial Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MorePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">More</h1>
      <div className="space-y-2">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="tap-target flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"
          >
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
