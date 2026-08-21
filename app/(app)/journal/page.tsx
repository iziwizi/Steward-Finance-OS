import { createClient } from "@/lib/supabase/server";
import { JournalClient } from "./journal-client";
import { MobilePageHeader } from "@/components/mobile-page-header";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  const params = await searchParams;
  const selectedEntryId = params.entry;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("financial_journal_entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("entry_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 pb-12">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader title="Financial Journal" fallbackHref="/dashboard" />

      {/* Header matching Figma desktop-journal-page */}
      <div className="hidden md:flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Journal</h1>
          <p className="text-xs text-zinc-500">
            Maintain clear notes and strategic reasoning alongside your raw ledgers.
          </p>
        </div>
      </div>

      <JournalClient entries={entries ?? []} initialSelectedId={selectedEntryId} />
    </div>
  );
}
