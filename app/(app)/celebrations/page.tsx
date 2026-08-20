import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";

export default async function CelebrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: celebrations } = await supabase
    .from("celebrations")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Wins & Milestones</p>
        <h1 className="text-display-md text-zinc-900">Celebration Center</h1>
        <p className="mt-1 text-xs text-zinc-500">Every win, however small, compounds into generational wealth.</p>
      </div>

      <div className="space-y-3">
        {(celebrations ?? []).map((c) => (
          <div key={c.id} className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-900">{c.title}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{c.message}</p>
                <p className="mt-2 text-[11px] font-medium text-zinc-400">
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {(celebrations ?? []).length === 0 && (
          <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center text-xs text-zinc-400">
            No celebrations recorded yet. As you record income, pay off bills, and fund your allocation buckets, your wins will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
