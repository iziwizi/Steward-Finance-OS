"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Mobile search trigger — navigates to the dedicated /search page.
 * The full search experience (input, quick nav chips, results) lives there,
 * so Quick Navigation chips never accidentally overlay the dashboard cards.
 */
export function MobileSearchModal() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/search")}
      aria-label="Open Search"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
    >
      <Search className="h-5 w-5" strokeWidth={1.8} />
    </button>
  );
}
