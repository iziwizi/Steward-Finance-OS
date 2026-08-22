"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, UserCheck, Search, Loader2, Check, AlertCircle } from "lucide-react";
import { setUserRoleAction } from "@/lib/actions/admin";

export interface AdminUserRecord {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  created_at: string;
  updated_at?: string | null;
  onboarding_completed_at?: string | null;
}

export function AdminUsersTable({
  users = [],
  currentAdminId,
}: {
  users: AdminUserRecord[];
  currentAdminId: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const emailMatch = u.email.toLowerCase().includes(term);
    const nameMatch = (u.full_name || "").toLowerCase().includes(term);
    const idMatch = u.id.toLowerCase().includes(term);
    return emailMatch || nameMatch || idMatch;
  });

  const handleRoleChange = (userId: string, newRole: "user" | "admin") => {
    setFeedback(null);
    startTransition(async () => {
      const res = await setUserRoleAction(userId, newRole);
      if (res.success) {
        setFeedback({ id: userId, type: "success", text: `User role updated to ${newRole}.` });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ id: userId, type: "error", text: res.error || "Failed to update role." });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <span className="text-xs font-semibold text-zinc-500 shrink-0">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Onboarding</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminId;
                  const joinedDate = new Date(u.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const isOnboarded = Boolean(u.onboarding_completed_at);

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">
                            {u.full_name || "Anonymous User"}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">
                            {u.id.slice(0, 8)}...{u.id.slice(-4)}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-zinc-700">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {u.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                          {u.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            isOnboarded
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isOnboarded ? "Completed" : "In Progress"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {joinedDate}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isCurrentAdmin ? (
                          <select
                            value={u.role}
                            disabled={isPending}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as "user" | "admin")}
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 focus:border-brand-500 focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Make Admin</option>
                          </select>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400 italic">
                            Current Session
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
