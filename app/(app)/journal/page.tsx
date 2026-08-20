import { BookOpen, Plus, Calendar, CheckCircle, AlertCircle, Trash2, Edit3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createJournalEntry, deleteJournalEntry } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; new?: string }>;
}) {
  const params = await searchParams;
  const selectedEntryId = params.entry;
  const isCreatingNew = params.new === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("financial_journal_entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("entry_date", { ascending: false })
    .limit(20);

  const selectedEntry =
    (entries ?? []).find((e) => e.id === selectedEntryId) || (entries ?? [])[0] || null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-journal-page */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Journal</h1>
          <p className="text-xs text-zinc-500">
            Maintain clear notes and strategic reasoning alongside your raw ledgers.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-journal-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Historical Journal Entry List (4/12 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Historical Journal
            </h2>
            <a
              href="/journal?new=true"
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-brand-600"
            >
              <Plus className="h-3 w-3" />
              New Entry
            </a>
          </div>

          <div className="space-y-2.5">
            {(entries ?? []).length === 0 ? (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-6 text-center text-xs text-zinc-400">
                No entries recorded yet. Click "New Entry" to write your first reflection.
              </div>
            ) : (
              (entries ?? []).map((e, idx) => {
                const isSelected = selectedEntry?.id === e.id && !isCreatingNew;
                const categories = ["Rent Commitments", "Discrepancies", "Compliance", "Asset Sales", "Capital Outflow"];
                const categoryTag = categories[idx % categories.length];

                return (
                  <a
                    key={e.id}
                    href={`/journal?entry=${e.id}`}
                    className={`block rounded-xl border p-4 shadow-xs transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500"
                        : "border-zinc-200/80 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-brand-100/70 px-1.5 py-0.5 text-[9px] font-bold text-brand-800 uppercase tracking-wider">
                        {categoryTag}
                      </span>
                      <span className="text-[10px] text-zinc-400">{e.entry_date}</span>
                    </div>
                    <p className="mt-2 truncate text-xs font-bold text-zinc-900">
                      {e.did_well || "Monthly Financial Strategy & Allocation Notes"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 leading-normal">
                      {e.grateful_for || e.mistakes || e.improve_next_month || "Reflections on spending patterns and stewardship decisions."}
                    </p>
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Entry Viewer or Editor (8/12 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* New Entry Form */}
          {isCreatingNew || (entries ?? []).length === 0 ? (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-zinc-900">Add New Strategic Reflection</h2>
              <form action={createJournalEntry} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Entry Date</label>
                  <input
                    name="entry_date"
                    type="date"
                    defaultValue={today}
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    What did I do well financially?
                  </label>
                  <textarea
                    name="did_well"
                    placeholder="e.g. Stuck to food budget, set aside 20% into investments..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">What mistakes did I make?</label>
                  <textarea
                    name="mistakes"
                    placeholder="e.g. Impulse tech accessory purchase, overlooked auto-renewal..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    What will I improve next month?
                  </label>
                  <textarea
                    name="improve_next_month"
                    placeholder="e.g. Plan meals weekly, review subscription renewals before billing date..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    One thing I'm grateful to God for this month
                  </label>
                  <textarea
                    name="grateful_for"
                    placeholder="e.g. Provision, peace, good stewardship..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <a
                    href="/journal"
                    className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </a>
                  <Button type="submit" variant="primary" className="px-4 py-1.5 text-xs">
                    Save Entry
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Active Entry Viewer matching Figma desktop-journal-page */
            selectedEntry && (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                    Strategic Review
                  </span>
                  <span className="ml-3 text-[11px] text-zinc-400">
                    Recorded on {selectedEntry.entry_date}
                  </span>
                  <h2 className="mt-3 text-lg font-bold text-zinc-900">
                    {selectedEntry.did_well || "Monthly Financial Strategy & Lease Review"}
                  </h2>
                </div>

                <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
                  {selectedEntry.did_well && (
                    <div>
                      <p className="font-bold text-zinc-900 mb-1">Financial Progress & Discipline:</p>
                      <p className="text-zinc-600">{selectedEntry.did_well}</p>
                    </div>
                  )}

                  {selectedEntry.mistakes && (
                    <div>
                      <p className="font-bold text-zinc-900 mb-1">Learnings & Corrections:</p>
                      <p className="text-zinc-600">{selectedEntry.mistakes}</p>
                    </div>
                  )}

                  {selectedEntry.improve_next_month && (
                    <div>
                      <p className="font-bold text-zinc-900 mb-1">Action Items for Next Month:</p>
                      <p className="text-zinc-600">{selectedEntry.improve_next_month}</p>
                    </div>
                  )}

                  {selectedEntry.grateful_for && (
                    <div className="rounded-lg bg-amber-50/60 border border-amber-200/60 p-3.5">
                      <p className="font-bold text-amber-900 mb-1">Gratitude & Spiritual Stewardship:</p>
                      <p className="text-amber-950/80">{selectedEntry.grateful_for}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions matching Figma desktop-journal-page */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                  <form
                    action={async () => {
                      "use server";
                      await deleteJournalEntry(selectedEntry.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                  <a
                    href="/journal?new=true"
                    className="inline-flex items-center rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
                  >
                    New Entry
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
