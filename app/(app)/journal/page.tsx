import { BookOpen, Plus, Calendar, CheckCircle, AlertCircle, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createJournalEntry } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

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
    .limit(20);

  const selectedEntry =
    (entries ?? []).find((e) => e.id === selectedEntryId) || (entries ?? [])[0] || null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Financial Journal</h1>
        <p className="text-xs text-zinc-500">
          Monthly reflections and stewardship notes explaining your money decisions.
        </p>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-journal-page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Historical Journal Entry List (4/12 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Historical Journal
            </h2>
            <span className="text-xs text-zinc-400">{(entries ?? []).length} entries</span>
          </div>

          <div className="space-y-2.5">
            {(entries ?? []).length === 0 ? (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-6 text-center text-xs text-zinc-400">
                No entries recorded yet.
              </div>
            ) : (
              (entries ?? []).map((e) => {
                const isSelected = selectedEntry?.id === e.id;
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
                      <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                        {new Date(e.entry_date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-zinc-400">{e.entry_date}</span>
                    </div>
                    <p className="mt-1.5 truncate text-xs font-bold text-zinc-900">
                      {e.did_well || e.improve_next_month || "Monthly Stewardship Note"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 leading-normal">
                      {e.grateful_for || e.mistakes || "Reflections on monthly spending and savings."}
                    </p>
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Entry Viewer & New Entry Form (8/12 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Active Entry Detail View */}
          {selectedEntry && (
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 pb-4">
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-800">
                  {new Date(selectedEntry.entry_date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  Review
                </span>
                <h2 className="mt-2 text-base font-bold text-zinc-900">
                  Stewardship Review & Reflections
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Recorded on {selectedEntry.entry_date}</p>
              </div>

              {selectedEntry.did_well && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    What Went Well Financially
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 leading-relaxed pl-5">
                    {selectedEntry.did_well}
                  </p>
                </div>
              )}

              {selectedEntry.mistakes && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    Mistakes & Learnings
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 leading-relaxed pl-5">
                    {selectedEntry.mistakes}
                  </p>
                </div>
              )}

              {selectedEntry.improve_next_month && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <Calendar className="h-3.5 w-3.5 text-brand-600" />
                    Improvements for Next Month
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 leading-relaxed pl-5">
                    {selectedEntry.improve_next_month}
                  </p>
                </div>
              )}

              {selectedEntry.grateful_for && (
                <div className="rounded-lg bg-amber-50/60 border border-amber-200/60 p-4">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Heart className="h-3.5 w-3.5 text-amber-600" />
                    Gratitude to God
                  </h3>
                  <p className="mt-1 text-xs text-amber-950/80 leading-relaxed pl-5">
                    {selectedEntry.grateful_for}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* New Entry Creation Form */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900">Add New Reflection Entry</h2>
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
                  placeholder="e.g. Continuous provision, health, peace in financial management..."
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Save Reflection Entry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
