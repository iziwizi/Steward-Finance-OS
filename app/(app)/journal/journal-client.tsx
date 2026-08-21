"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Calendar, BookOpen, X, Loader2, Sparkles } from "lucide-react";
import { createJournalEntry, deleteJournalEntry } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export function JournalClient({
  entries,
  initialSelectedId,
}: {
  entries: any[];
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId || (entries.length > 0 ? entries[0].id : null)
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const selectedEntry = entries.find((e) => e.id === selectedId) || entries[0] || null;
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (isFormOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isFormOpen]);

  const categories = ["Rent Commitments", "Discrepancies", "Compliance", "Asset Sales", "Capital Outflow", "Discipline"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Historical Journal Entry List (4/12 cols) */}
      <div className="space-y-4 lg:col-span-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Historical Journal
          </h2>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3 w-3" />
            New Entry
          </button>
        </div>

        <div className="space-y-2.5">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-6 text-center text-xs text-zinc-400">
              <BookOpen className="mx-auto h-6 w-6 text-zinc-300 mb-2" />
              <p className="font-semibold text-zinc-700">No journal entries yet</p>
              <p className="mt-1">Click "New Entry" to record your strategic notes and reflections.</p>
            </div>
          ) : (
            entries.map((e, idx) => {
              const isSelected = selectedEntry?.id === e.id && !isFormOpen;
              const categoryTag = categories[idx % categories.length];

              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => {
                    setSelectedId(e.id);
                    setIsFormOpen(false);
                  }}
                  className={`w-full text-left rounded-xl border p-4 shadow-xs transition-all ${
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
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Selected Entry Viewer or Editor Form (8/12 cols) */}
      <div className="space-y-6 lg:col-span-8">
        {isFormOpen ? (
          /* New Entry Form */
          <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm animate-in fade-in duration-fast">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">New Journal Reflection</h2>
                <p className="text-xs text-zinc-400">Capture financial notes, lessons, and spiritual stewardship.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createJournalEntry(formData);
                setIsFormOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-zinc-700">Entry Date</label>
                <input
                  ref={firstInputRef}
                  name="entry_date"
                  type="date"
                  defaultValue={today}
                  required
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

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 px-4 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" className="h-8 px-4 text-xs">
                  Save Entry
                </Button>
              </div>
            </form>
          </div>
        ) : selectedEntry ? (
          /* Selected Entry Reader matching Figma desktop-journal-page */
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <form
                action={async () => {
                  await deleteJournalEntry(selectedEntry.id);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 px-3.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-rose-600"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-500 px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Entry
              </button>
            </div>
          </div>
        ) : (
          /* Reader Empty State when no entries exist and form is closed */
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400 space-y-3">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="font-semibold text-sm text-zinc-800">Financial Journal Reader</p>
            <p className="max-w-sm mx-auto text-zinc-500">
              Document your financial learnings, milestones, and strategic commitments alongside your raw ledgers.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                + Create First Reflection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
