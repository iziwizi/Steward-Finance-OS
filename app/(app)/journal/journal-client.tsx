"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Plus, Trash2, Edit3, Calendar, BookOpen, X, Loader2, Heart, TrendingUp, AlertTriangle, Target, Check, AlertCircle } from "lucide-react";
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export interface JournalEntry {
  id: string;
  entry_date: string;
  did_well?: string | null;
  mistakes?: string | null;
  surprises?: string | null;
  improve_next_month?: string | null;
  grateful_for?: string | null;
  created_at: string;
}

export function JournalClient({
  entries = [],
  initialSelectedId,
}: {
  entries: JournalEntry[];
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId || (entries.length > 0 ? entries[0].id : null)
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const firstInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const selectedEntry = entries.find((e) => e.id === selectedId) || entries[0] || null;

  useEffect(() => {
    if (isFormOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isFormOpen]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
    setFeedback(null);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setSelectedId(entry.id);
    setIsFormOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        if (editingEntry) {
          formData.append("id", editingEntry.id);
          const res = await updateJournalEntry(formData);
          if (res?.entry) {
            setSelectedId(res.entry.id);
          }
          setFeedback({ type: "success", text: "Journal entry updated successfully." });
        } else {
          const res = await createJournalEntry(formData);
          if (res?.entry) {
            setSelectedId(res.entry.id);
          }
          setFeedback({ type: "success", text: "New journal entry recorded." });
        }
        setIsFormOpen(false);
        setEditingEntry(null);
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ type: "error", text: err.message || "Failed to save journal entry." });
      }
    });
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this journal entry?")) {
      return;
    }
    setIsDeletingId(entryId);
    setFeedback(null);

    startTransition(async () => {
      try {
        await deleteJournalEntry(entryId);
        if (selectedId === entryId) {
          const remaining = entries.filter((e) => e.id !== entryId);
          setSelectedId(remaining.length > 0 ? remaining[0].id : null);
        }
        setFeedback({ type: "success", text: "Journal entry deleted." });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        setFeedback({ type: "error", text: err.message || "Failed to delete entry." });
      } finally {
        setIsDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Page Header Toolbar with ONE clear action */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Financial Reflection & Stewardship Journal</h2>
          <p className="text-xs text-zinc-400">
            Record your financial lessons, disciplines, action items, and gratitude.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleOpenNew}
          variant="primary"
          className="px-3.5 py-1.5 text-xs font-semibold"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Entry
        </Button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Journal List (5/12 cols) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Journal Entries ({entries.length})
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-400 space-y-2">
              <BookOpen className="mx-auto h-7 w-7 text-zinc-300" />
              <p className="font-bold text-zinc-700">No journal entries yet</p>
              <p>Click &quot;New Entry&quot; above to capture your first financial reflection.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {entries.map((e) => {
                const isSelected = selectedEntry?.id === e.id && !isFormOpen;
                const formattedDate = new Date(e.entry_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const summaryText = e.did_well || e.grateful_for || e.improve_next_month || e.mistakes || "Personal financial reflections";

                return (
                  <div
                    key={e.id}
                    onClick={() => {
                      setSelectedId(e.id);
                      setIsFormOpen(false);
                      setEditingEntry(null);
                    }}
                    className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500"
                        : "border-zinc-200/80 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-brand-600" />
                        <span>{formattedDate}</span>
                      </span>
                      <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(e)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-brand-600"
                          title="Edit entry"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingId === e.id}
                          onClick={() => handleDelete(e.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete entry"
                        >
                          {isDeletingId === e.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs text-zinc-600 leading-relaxed font-medium">
                      {summaryText}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Entry Reader or Form (7/12 cols) */}
        <div className="lg:col-span-7">
          {isFormOpen ? (
            /* CREATE OR EDIT FORM */
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-fast">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingEntry ? "Edit Journal Entry" : "New Financial Reflection"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingEntry ? "Update your financial learnings and goals." : "Capture learnings, disciplines, and spiritual stewardship."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingEntry(null);
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Entry Date
                  </label>
                  <input
                    ref={firstInputRef}
                    name="entry_date"
                    type="date"
                    defaultValue={editingEntry?.entry_date || today}
                    required
                    className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Financial Progress & Discipline</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-1">What went well financially? What positive habits did you maintain?</p>
                  <textarea
                    name="did_well"
                    defaultValue={editingEntry?.did_well || ""}
                    placeholder="e.g. Stuck to grocery budget, transferred 15% into investment vault, resisted impulse tech purchase..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Learnings & Corrections</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-1">What financial missteps occurred? What can you learn from them?</p>
                  <textarea
                    name="mistakes"
                    defaultValue={editingEntry?.mistakes || ""}
                    placeholder="e.g. Overspent on dining out during weekend trip, forgot to cancel unused trial subscription..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-brand-600" />
                    <span>Action Items for Next Month</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-1">Specific goals and guardrails for the upcoming month.</p>
                  <textarea
                    name="improve_next_month"
                    defaultValue={editingEntry?.improve_next_month || ""}
                    placeholder="e.g. Meal prep twice a week, cap entertainment to ₦40,000, review utility bills..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span>Gratitude & Spiritual Stewardship</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-1">What blessings, provision, and kingdom impact are you thankful for?</p>
                  <textarea
                    name="grateful_for"
                    defaultValue={editingEntry?.grateful_for || ""}
                    placeholder="e.g. Grateful for health, consistent freelance inflow, and ability to support family and church giving..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingEntry(null);
                    }}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" disabled={isPending} className="px-5 py-2 text-xs font-bold">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingEntry ? "Update Entry" : "Save Entry"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : selectedEntry ? (
            /* SELECTED ENTRY READER VIEW */
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
                <div>
                  <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200/60 rounded px-2 py-0.5">
                    Financial Reflection
                  </span>
                  <span className="ml-2 text-xs text-zinc-400">
                    Recorded on {new Date(selectedEntry.entry_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedEntry)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingId === selectedEntry.id}
                    onClick={() => handleDelete(selectedEntry.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-100 transition-all"
                  >
                    {isDeletingId === selectedEntry.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="space-y-5 text-xs leading-relaxed">
                {selectedEntry.did_well && (
                  <div className="rounded-xl bg-emerald-50/40 border border-emerald-100 p-4 space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Financial Progress & Discipline</span>
                    </p>
                    <p className="text-zinc-700 whitespace-pre-wrap">{selectedEntry.did_well}</p>
                  </div>
                )}

                {selectedEntry.mistakes && (
                  <div className="rounded-xl bg-amber-50/40 border border-amber-100 p-4 space-y-1">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Learnings & Corrections</span>
                    </p>
                    <p className="text-zinc-700 whitespace-pre-wrap">{selectedEntry.mistakes}</p>
                  </div>
                )}

                {selectedEntry.improve_next_month && (
                  <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-4 space-y-1">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>Action Items for Next Month</span>
                    </p>
                    <p className="text-zinc-700 whitespace-pre-wrap">{selectedEntry.improve_next_month}</p>
                  </div>
                )}

                {selectedEntry.grateful_for && (
                  <div className="rounded-xl bg-rose-50/30 border border-rose-100 p-4 space-y-1">
                    <p className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Gratitude & Spiritual Stewardship</span>
                    </p>
                    <p className="text-zinc-700 whitespace-pre-wrap">{selectedEntry.grateful_for}</p>
                  </div>
                )}

                {!selectedEntry.did_well && !selectedEntry.mistakes && !selectedEntry.improve_next_month && !selectedEntry.grateful_for && (
                  <p className="text-zinc-400 italic">No detailed notes recorded in this entry.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400 space-y-3">
              <BookOpen className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="font-semibold text-sm text-zinc-800">Financial Journal</p>
              <p className="max-w-sm mx-auto text-zinc-500">
                Select an entry on the left to read details, or record a new entry to reflect on your financial journey.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
