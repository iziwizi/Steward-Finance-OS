import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ProgressHeader({ step, back }: { step: number; back: string }) {
  const totalSteps = 5;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <Link
          href={back}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Link>
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          Step {step} of {totalSteps}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
