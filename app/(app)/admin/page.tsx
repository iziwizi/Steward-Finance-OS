import { requireAdmin, getAdminUsersList } from "@/lib/actions/admin";
import { getAllAdminSupportTickets } from "@/lib/actions/support";
import { AdminUsersTable } from "./admin-users-table";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { ShieldCheck, Users, CheckCircle2, MessageSquare, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const { user, profile } = await requireAdmin();
  const [users, tickets] = await Promise.all([
    getAdminUsersList(),
    getAllAdminSupportTickets(),
  ]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((u: any) => u.role === "admin").length;
  const totalOnboarded = users.filter((u: any) => Boolean(u.onboarding_completed_at)).length;

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const waitingUserTickets = tickets.filter((t) => t.status === "waiting_for_user").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-6 pb-16">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Super Admin Console" fallbackHref="/dashboard" />

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Super Admin Console</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
              <ShieldCheck className="h-3 w-3" />
              Platform Administrator
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registered accounts, platform roles, user onboarding telemetry, and support queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 active:scale-95 transition-all"
          >
            <span>Support Queue</span>
            {openTickets > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] text-amber-800 font-bold">
                {openTickets} Active
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600 font-bold">
                {tickets.length} Total
              </span>
            )}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            <span>Return to App</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalUsers}</p>
          <p className="text-[11px] text-zinc-400">{totalAdmins} admin · {totalUsers - totalAdmins} tenant accounts</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Onboarding Finished</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{totalOnboarded}</p>
          <p className="text-[11px] text-zinc-400">Completed financial onboarding</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Support Tickets</span>
            <MessageSquare className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{openTickets}</p>
          <p className="text-[11px] text-zinc-400">{waitingUserTickets} awaiting user · {resolvedTickets} resolved</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Support Hub</span>
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>View Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{tickets.length}</p>
          <p className="text-[11px] text-zinc-400">Total tickets handled</p>
        </div>
      </div>

      {/* Main Users Table Section */}
      <div className="space-y-4">
        <div className="border-b border-zinc-100 pb-2">
          <h2 className="text-sm font-bold text-zinc-900">Registered Platform Users</h2>
          <p className="text-xs text-zinc-400">
            View user records and manage platform administrator privileges.
          </p>
        </div>

        <AdminUsersTable users={users} currentAdminId={user.id} />
      </div>
    </div>
  );
}
