"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, Target, Receipt, RefreshCw, BookOpen, ArrowLeftRight, Landmark, Compass, X, Heart, PieChart } from "lucide-react";
import { searchWorkspace, type SearchResultItem } from "@/lib/actions/search";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      case "wishlist":
        return Heart;
      case "allocation":
        return PieChart;
      case "journal":
        return BookOpen;
      default:
        return Search;
    }
  };

  const navResults = results.filter((r) => r.category === "navigation");
  const dataResults = results.filter((r) => r.category !== "navigation");

  return (
    <div className="relative w-80" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search transactions, goals, bills, pages..."
          className="w-full rounded-lg border border-zinc-200/80 bg-zinc-50/50 py-1.5 pl-8 pr-7 text-xs text-zinc-800 placeholder-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-lg animate-in fade-in zoom-in-95 duration-fast">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-zinc-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-500" />
              Searching workspace...
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              No matching records found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              {navResults.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Navigation ({navResults.length})
                  </p>
                  {navResults.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-zinc-50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-brand-50 text-brand-600">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-zinc-900">{item.title}</p>
                            <p className="truncate text-[10px] text-zinc-400">{item.subtitle}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-xs bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
                          Page
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {dataResults.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-t border-zinc-100 pt-1.5">
                    Data & Records ({dataResults.length})
                  </p>
                  {dataResults.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-zinc-50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-600">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-zinc-900">{item.title}</p>
                            <p className="truncate text-[10px] text-zinc-400">{item.subtitle}</p>
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
          )}
        </div>
      )}
    </div>
  );
}
