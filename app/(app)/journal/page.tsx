import { createClient } from "@/lib/supabase/server";
import { createJournalEntry } from "@/lib/actions/misc";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: entries } = await supabase
    .from("financial_journal_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("entry_date", { ascending: false })
    .limit(12);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Financial Journal</h1>

      <section className="rounded-2xl border border-ink/10 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink/70">New Entry</h2>
        <form action={createJournalEntry} className="mt-3 space-y-3">
          <input
            name="entry_date"
            type="date"
            defaultValue={today}
            className="tap-target w-full rounded-xl border border-ink/15 px-3 text-sm"
          />
          <textarea
            name="did_well"
            placeholder="What did I do well financially?"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
            rows={2}
          />
          <textarea
            name="mistakes"
            placeholder="What mistakes did I make?"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
            rows={2}
          />
          <textarea
            name="surprises"
            placeholder="What surprised me?"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
            rows={2}
          />
          <textarea
            name="improve_next_month"
            placeholder="What will I improve next month?"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
            rows={2}
          />
          <textarea
            name="grateful_for"
            placeholder="One thing I'm grateful to God for this month"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
            rows={2}
          />
          <button className="tap-target w-full rounded-xl bg-accent font-medium text-white">
            Save Entry
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {(entries ?? []).map((e) => (
          <div key={e.id} className="rounded-2xl border border-ink/10 bg-white p-4 text-sm">
            <p className="mb-2 text-xs font-medium text-ink/50">{e.entry_date}</p>
            {e.did_well && <p><span className="font-medium">Did well:</span> {e.did_well}</p>}
            {e.mistakes && <p><span className="font-medium">Mistakes:</span> {e.mistakes}</p>}
            {e.surprises && <p><span className="font-medium">Surprised:</span> {e.surprises}</p>}
            {e.improve_next_month && (
              <p><span className="font-medium">Improve:</span> {e.improve_next_month}</p>
            )}
            {e.grateful_for && <p><span className="font-medium">Grateful:</span> {e.grateful_for}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
