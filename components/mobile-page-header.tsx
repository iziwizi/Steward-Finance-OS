"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function MobilePageHeader({
  title,
  subtitle,
  fallbackHref = "/dashboard",
  action,
}: {
  title: string;
  subtitle?: string;
  fallbackHref?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 md:hidden py-1 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-zinc-900 truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-zinc-500 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}