"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Sliders, BookOpen, Bell, ShieldAlert, LogOut, Loader2 } from "lucide-react";

export interface SettingsTabItem {
  id: string;
  label: string;
  icon: any;
  danger?: boolean;
}

const TABS: SettingsTabItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "accounts", label: "Account", icon: CreditCard },
  { id: "allocations", label: "Allocation Percentages", icon: Sliders },
  { id: "instructions", label: "Instructions & Guide", icon: BookOpen },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Deletion", icon: ShieldAlert, danger: true },
  { id: "logout", label: "Log Out of StewardOS", icon: LogOut, danger: true },
];

export function SettingsNav({ currentTab }: { currentTab: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTabClick = (tabId: string) => {
    startTransition(() => {
      router.push(`/settings?tab=${tabId}`);
    });
  };

  return (
    <nav className="space-y-1 rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-brand-50 text-brand-600 shadow-xs"
                : tab.danger
                ? "text-rose-600 hover:bg-rose-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </div>
            {isPending && !isActive && (
              <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
