import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";

const TYPE_ICON_COLOR: Record<string, string> = {
  first_income: "text-accent",
  first_expense: "text-accent",
  goal_milestone: "text-gold",
  goal_completed: "text-accent",
  tithe_paid: "text-gold",
  positive_cash_flow: "text-accent",
};

export default async function CelebrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: celebrations } = await supabase
    .from("celebrations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Celebration Center</h1>
      <p className="text-sm text-ink/50">Every win, however small, adds up.</p>

      <div className="space-y-2">
        {(celebrations ?? []).map((c) => (
          <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex items-start gap-3">
              <Sparkles
                className={`mt-0.5 h-5 w-5 shrink-0 ${TYPE_ICON_COLOR[c.type] ?? "text-accent"}`}
              />
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-ink/60">{c.message}</p>
                <p className="mt-1 text-[11px] text-ink/40">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {(celebrations ?? []).length === 0 && (
          <p className="text-sm text-ink/50">
            Nothing here yet — your first recorded income or expense will show up.
          </p>
        )}
      </div>
    </div>
  );
}
