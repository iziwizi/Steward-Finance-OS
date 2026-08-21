"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { updateBucketTargetPercent } from "@/lib/actions/buckets";

export function TargetPercentEditor({
  bucketId,
  bucketName,
  initialPercent,
}: {
  bucketId: string;
  bucketName: string;
  initialPercent: number;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [percent, setPercent] = useState(String(initialPercent));
  const [isPending, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPercent(String(initialPercent));
  }, [initialPercent]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(percent);
    if (isNaN(num) || num < 0 || num > 100) return;

    startTransition(async () => {
      const res = await updateBucketTargetPercent(bucketId, num);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-brand-700 transition-colors"
        title="Edit allocation target percentage"
      >
        <span>{initialPercent}%</span>
        <Pencil className="h-3 w-3 text-zinc-400 opacity-60 group-hover:opacity-100 group-hover:text-brand-600 transition-all" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-fast">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate max-w-[120px]">
              {bucketName} Target
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-2.5">
            <div>
              <label className="text-[10px] font-medium text-zinc-500">Target Share (%)</label>
              <div className="relative mt-0.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-1 pl-2.5 pr-7 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                  autoFocus
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
