import { Leaf } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500">
        <Leaf className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      </div>
      <span className="text-lg font-bold text-zinc-900">StewardOS</span>
    </div>
  );
}
