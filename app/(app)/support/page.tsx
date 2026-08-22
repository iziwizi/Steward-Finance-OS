import { getUserSupportTickets } from "@/lib/actions/support";
import { SupportClient } from "./support-client";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function SupportPage() {
  const tickets = await getUserSupportTickets();

  return (
    <div className="space-y-6 pb-16">
      {/* Mobile Back Header */}
      <MobilePageHeader title="Support" fallbackHref="/more" />

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Support & Inquiries</h1>
        <p className="text-xs text-zinc-500">
          Get in touch with the StewardOS engineering and support team.
        </p>
      </div>

      <SupportClient initialTickets={tickets} />
    </div>
  );
}
