import { getSupportTicketWithMessages } from "@/lib/actions/support";
import { TicketThreadClient } from "./ticket-thread-client";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ticket, messages, currentUser } = await getSupportTicketWithMessages(id);

  return (
    <div className="space-y-6 pb-16">
      <MobilePageHeader title="Support Ticket" fallbackHref="/support" />
      <TicketThreadClient
        ticket={ticket}
        messages={messages}
        currentUser={currentUser}
      />
    </div>
  );
}
