"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export function MonthlyExportDropdown({
  from,
  to,
  className = "",
  compact = false,
}: {
  from: string;
  to: string;
  className?: string;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const exportUrl = (format: string) => `/api/export?format=${format}&from=${from}&to=${to}`;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition-all ${
          compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs"
        }`}
      >
        <Download className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} text-zinc-500`} />
        <span>Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-fast">
          <a
            href={exportUrl("csv")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <FileText className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export as CSV</span>
          </a>
          <a
            href={exportUrl("excel")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </a>
          <a
            href={exportUrl("pdf")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <FileText className="h-3.5 w-3.5 text-rose-500" />
            <span>Print / Save PDF</span>
          </a>
        </div>
      )}
    </div>
  );
}
