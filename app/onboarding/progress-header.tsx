import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ProgressHeader({ step, back }: { step: number; back: string }) {
  const totalSteps = 5;
  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Step {step} of {totalSteps}
        </p>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-slow ease-out-motion"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
