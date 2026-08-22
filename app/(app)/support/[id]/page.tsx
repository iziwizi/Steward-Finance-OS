import { getSupportTicketWithMessages } from "@/lib/actions/support";
import { TicketThreadClient } from "./ticket-thread-client";
import { MobilePageHeader } from "@/components/mobile-page-header";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ticketData: Awaited<ReturnType<typeof getSupportTicketWithMessages>> | null = null;
  let loadError: string | null = null;

  try {
    ticketData = await getSupportTicketWithMessages(id);
  } catch (err: any) {
    loadError = err?.message || "Unable to load this support ticket.";
  }

  return (
    <div className="space-y-6 pb-16">
      <MobilePageHeader title="Support Ticket" fallbackHref="/support" />

      {loadError ? (
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Ticket Unavailable</h2>
              <p className="mt-1 text-sm text-zinc-600">{loadError}</p>
            </div>
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Support
            </Link>
          </div>
        </div>
      ) : ticketData ? (
        <TicketThreadClient
          ticket={ticketData.ticket}
          messages={ticketData.messages}
          currentUser={ticketData.currentUser}
        />
      ) : null}
    </div>
  );
}
