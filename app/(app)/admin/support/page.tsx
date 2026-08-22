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
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 mb-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Admin Console</span>
          </Link>
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
      </div>

      <AdminSupportClient tickets={tickets} />
    </div>
  );
}
