"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Target,
  Receipt,
  RefreshCw,
  BookOpen,
  ArrowLeftRight,
  Landmark,
  Compass,
  X,
  Heart,
  PieChart,
  ChevronLeft,
} from "lucide-react";
import { searchWorkspace, type SearchResultItem } from "@/lib/actions/search";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchWorkspace(query);
        setResults(res);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const getCategoryIcon = (category: SearchResultItem["category"]) => {
    switch (category) {
      case "navigation": return Compass;
      case "transaction": return ArrowLeftRight;
      case "goal": return Target;
      case "bill": return Receipt;
      case "subscription": return RefreshCw;
      case "asset": return Landmark;
      case "wishlist": return Heart;
      case "allocation": return PieChart;
      case "journal": return BookOpen;
      default: return Search;
    }
  };

  const navResults = results.filter((r) => r.category === "navigation");
  const dataResults = results.filter((r) => r.category !== "navigation");

  const QUICK_LINKS = [
    { label: "Transactions", href: "/transactions" },
    { label: "Goals", href: "/goals" },
    { label: "Allocations", href: "/allocations" },
    { label: "Reports", href: "/reports" },
    { label: "Bills", href: "/bills" },
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Assets", href: "/assets" },
    { label: "Wishlist", href: "/wishlist" },
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-white md:hidden">
      {/* Mobile Page Header */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions, goals, bills..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-8 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Navigation — shown when query is empty */}
        {!query && (
          <div className="p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Quick Navigation
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-xs font-medium text-zinc-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-500" />
            Searching workspace...
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <div className="py-16 text-center text-xs text-zinc-400 px-6">
            No matching records found for &quot;{query}&quot;
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4 p-4">
            {/* Navigation Results */}
            {navResults.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Navigation ({navResults.length})
                </p>
                {navResults.map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 active:bg-zinc-100 border border-zinc-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-zinc-900">{item.title}</p>
                          <p className="truncate text-[11px] text-zinc-400">{item.subtitle}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-500 ml-2">
                        Page
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Data Results */}
            {dataResults.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-t border-zinc-100 pt-3">
                  Data ({dataResults.length})
                </p>
                {dataResults.map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 active:bg-zinc-100 border border-zinc-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-zinc-900">{item.title}</p>
                          <p className="truncate text-[11px] text-zinc-400">{item.subtitle}</p>
                        </div>
                      </div>
                      {item.amount !== undefined && (
                        <span className="shrink-0 text-xs font-bold text-zinc-900 ml-2">
                          ₦{item.amount.toLocaleString()}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
