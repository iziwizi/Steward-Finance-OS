"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { searchWorkspace, type SearchResultItem } from "@/lib/actions/search";

export function MobileSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

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
      case "navigation":
        return Compass;
      case "transaction":
        return ArrowLeftRight;
      case "goal":
        return Target;
      case "bill":
        return Receipt;
      case "subscription":
        return RefreshCw;
      case "asset":
        return Landmark;
      case "journal":
        return BookOpen;
      default:
        return Search;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Global Search"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
      >
        <Search className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-fast">
          {/* Mobile Search Header */}
          <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions, goals, bills, pages..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-8 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 px-2 py-1.5"
            >
              Cancel
            </button>
          </div>

          {/* Quick Navigation Chips if query is empty */}
          {!query && (
            <div className="p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Quick Navigation
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Transactions", href: "/transactions" },
                  { label: "Goals", href: "/goals" },
                  { label: "Allocations", href: "/allocations" },
                  { label: "Reports", href: "/reports" },
                  { label: "Bills", href: "/bills" },
                  { label: "Subscriptions", href: "/subscriptions" },
                  { label: "Assets", href: "/assets" },
                  { label: "Wishlist", href: "/wishlist" },
                ].map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-xs font-medium text-zinc-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-500" />
                Searching workspace...
              </div>
            ) : query && results.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                No matching records found for "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 border border-transparent hover:border-zinc-100"
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
                        <span className="shrink-0 text-xs font-bold text-zinc-900">
                          ₦{item.amount.toLocaleString()}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
