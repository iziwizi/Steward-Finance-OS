import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-200 bg-white px-6 py-10 text-center animate-fade-in-up">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
        <Icon className="h-6 w-6 text-brand-500" strokeWidth={1.75} />
      </div>
      <p className="mt-6 text-base font-semibold text-zinc-900">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-zinc-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="tap-target mt-6 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
