import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import type { OperationalInsight } from "@/lib/data/insights";

export function StewardInsightBanner({
  insight,
  className = "",
}: {
  insight?: OperationalInsight | { title: string; desc: string; tag?: string } | null;
  className?: string;
}) {
  const displayTitle = insight?.title || "Active Stewardship Health";
  const displayDesc =
    insight?.desc ||
    "Your financial workspace is active. Record daily transactions and confirm envelope obligations to maintain high stewardship health.";
  const displayTag = "tag" in (insight || {}) ? (insight as any).tag : null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-brand-200/80 bg-brand-50/70 p-4 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white mt-0.5 sm:mt-0">
          <Zap className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">
              Steward Insight
            </span>
            {displayTag && (
              <span className="rounded-full bg-brand-100/80 px-2 py-0.2 text-[9px] font-bold text-brand-800">
                {displayTag}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-zinc-900 mt-0.5">{displayTitle}</p>
          <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">{displayDesc}</p>
        </div>
      </div>

      <Link
        href="/celebrations"
        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-center ml-11 sm:ml-0"
      >
        <span>View Insights</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
