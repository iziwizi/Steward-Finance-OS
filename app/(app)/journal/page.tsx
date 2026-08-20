import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createJournalEntry } from "@/lib/actions/misc";
import { Button } from "@/components/ui/button";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: entries } = await supabase
    .from("financial_journal_entries")
    .select("*")
    .eq("user_id", user?.id)
    .order("entry_date", { ascending: false })
    .limit(12);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Reflections</p>
        <h1 className="text-display-md text-zinc-900">Financial Journal</h1>
        <p className="mt-1 text-xs text-zinc-500">Record your stewardship thoughts, lessons, and blessings each month.</p>
      </div>

      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">New Journal Entry</h2>
        <form action={createJournalEntry} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Entry Date</label>
            <input
              name="entry_date"
              type="date"
              defaultValue={today}
              className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">What went well financially?</label>
            <textarea
              name="did_well"
              placeholder="e.g. Stuck to budget on dining, received unexpected dividend"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">What mistakes did I make?</label>
            <textarea
              name="mistakes"
              placeholder="e.g. Impulse subscription renewal, unplanned takeout"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">What will I improve next month?</label>
            <textarea
              name="improve_next_month"
              placeholder="e.g. Increase emergency fund allocation by 5%"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">What am I grateful for?</label>
            <textarea
              name="grateful_for"
              placeholder="e.g. Provision for family, health, and peace of mind"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={2}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Save Entry
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Past Reflections</h2>
        {(entries ?? []).map((e) => (
          <div key={e.id} className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">{e.entry_date}</p>
            {e.did_well && (
              <div>
                <p className="text-xs font-semibold text-zinc-700">What Went Well</p>
                <p className="text-sm text-zinc-600 mt-0.5">{e.did_well}</p>
              </div>
            )}
            {e.mistakes && (
              <div>
                <p className="text-xs font-semibold text-zinc-700">Mistakes & Learnings</p>
                <p className="text-sm text-zinc-600 mt-0.5">{e.mistakes}</p>
              </div>
            )}
            {e.grateful_for && (
              <div>
                <p className="text-xs font-semibold text-zinc-700">Gratitude</p>
                <p className="text-sm text-zinc-600 mt-0.5">{e.grateful_for}</p>
              </div>
            )}
          </div>
        ))}
        {(entries ?? []).length === 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center text-xs text-zinc-400">
            No journal entries recorded yet. Use the form above to record your first reflection.
          </div>
        )}
      </section>
    </div>
  );
}
