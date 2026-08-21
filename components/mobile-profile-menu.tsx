"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Settings, LogOut, User, ChevronRight } from "lucide-react";
import { logOut } from "@/lib/actions/auth";

export function MobileProfileMenu({
  avatarUrl,
  userName,
  userInitials,
}: {
  avatarUrl: string | null;
  userName: string;
  userInitials: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open Profile Menu"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-[11px] font-bold text-white shadow-xs ml-0.5 shrink-0 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
        ) : (
          <span>{userInitials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-fast z-50">
          {/* User Info Header */}
          <div className="flex items-center gap-2.5 p-2 border-b border-zinc-100 pb-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-xs font-bold text-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-900">{userName}</p>
              <p className="text-[10px] text-zinc-400">Personal Account</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="space-y-1 pt-1.5">
            <Link
              href="/settings?tab=profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-zinc-500" />
                <span>Account / Settings</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>

            <form action={logOut} onSubmit={() => setIsOpen(false)}>
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Log out</span>
                </div>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}