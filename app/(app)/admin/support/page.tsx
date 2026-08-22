import { requireAdmin } from "@/lib/actions/admin";
import { getAllAdminSupportTickets } from "@/lib/actions/support";
import { AdminSupportClient } from "./admin-support-client";
import { MobilePageHeader } from "@/components/mobile-page-header";
import { LifeBuoy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminSupportPage() {
  await requireAdmin();
  const tickets = await getAllAdminSupportTickets();

  return (
    <div className="space-y-6 pb-16">
      <MobilePageHeader title="Support Tickets" fallbackHref="/admin" />

      {/* Header */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Customer Support Queue</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              <LifeBuoy className="h-3 w-3" />
              Helpdesk V1
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage customer inquiry tickets, provide replies, and track resolution statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Admin Users Console</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            <span>Return to App</span>
          </Link>
        </div>
      </div>

      <AdminSupportClient tickets={tickets} />
    </div>
  );
}
