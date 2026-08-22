"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import { updateBucketPurpose } from "@/lib/actions/buckets";

export function BucketPurposeEditor({
  bucketId,
  bucketName,
  initialPurpose,
}: {
  bucketId: string;
  bucketName: string;
  initialPurpose?: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [purpose, setPurpose] = useState(initialPurpose || "");
  const [isPending, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPurpose(initialPurpose || "");
  }, [initialPurpose]);

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
    startTransition(async () => {
      const res = await updateBucketPurpose(bucketId, purpose);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="relative inline-block w-full max-w-[240px]" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-start gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-brand-700 transition-colors text-left w-full break-words"
        title="Edit allocation purpose"
      >
        {initialPurpose ? (
          <span className="italic text-zinc-600 group-hover:text-zinc-900 break-words leading-snug flex-1">
            &ldquo;{initialPurpose}&rdquo;
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium group-hover:text-brand-600 shrink-0">
            <Plus className="h-2.5 w-2.5" />
            <span>Set purpose</span>
          </span>
        )}
        <Pencil className="h-3 w-3 shrink-0 text-zinc-400 opacity-60 group-hover:opacity-100 group-hover:text-brand-600 transition-all mt-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-32px)] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-fast">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate max-w-[180px]">
              {bucketName} Purpose
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
              <label className="text-[10px] font-medium text-zinc-500">Envelope Purpose & Intent</label>
              <textarea
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Kingdom giving, emergency cushion, living expenses"
                className="mt-0.5 w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none resize-none leading-relaxed"
                autoFocus
              />
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
