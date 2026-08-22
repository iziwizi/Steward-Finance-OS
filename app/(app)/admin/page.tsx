import { requireAdmin, getAdminUsersList } from "@/lib/actions/admin";
import { AdminUsersTable } from "./admin-users-table";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { ShieldCheck, Users, CheckCircle2, UserPlus } from "lucide-react";

export default async function AdminDashboardPage() {
  const { user, profile } = await requireAdmin();
  const users = await getAdminUsersList();

  const totalUsers = users.length;
  const totalAdmins = users.filter((u: any) => u.role === "admin").length;
  const totalOnboarded = users.filter((u: any) => Boolean(u.onboarding_completed_at)).length;

  return (
    <div className="space-y-6 pb-16">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Super Admin Console" fallbackHref="/dashboard" />

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Super Admin Console</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
              <ShieldCheck className="h-3 w-3" />
              Super Admin Access
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registered accounts, platform roles, and user onboarding telemetry.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{totalUsers}</p>
          <p className="text-[11px] text-zinc-400">All registered tenant accounts</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Onboarding Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{totalOnboarded}</p>
          <p className="text-[11px] text-zinc-400">Finished initial financial setup</p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Admin Operators</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{totalAdmins}</p>
          <p className="text-[11px] text-zinc-400">Privileged administrator profiles</p>
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
