import { Sparkles, Award, TrendingUp, Compass, ArrowUpRight, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRealOperationalInsights } from "@/lib/data/insights";
import Link from "next/link";

export default async function CelebrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: celebrations }, operationalInsights] = await Promise.all([
    supabase
      .from("celebrations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(50),
    getRealOperationalInsights(user?.id || ""),
  ]);

  const celebrationList = celebrations ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-insights-celebrations */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Insights & Celebrations</h1>
          <p className="text-xs text-zinc-500">
            Real-time financial pattern analysis and milestone achievements from your active ledgers.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-insights-celebrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Operational Insights (7/12 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-zinc-900">Operational Insights</h2>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold text-zinc-600">
              {operationalInsights.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {operationalInsights.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-400">
                <TrendingUp className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                <p className="font-semibold text-zinc-700">More financial activity needed</p>
                <p className="mt-1">
                  Log your income and expenses to generate personalized spending insights and pattern diagnostics.
                </p>
                <div className="mt-4">
                  <Link
                    href="/add"
                    className="inline-flex items-center rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
                  >
                    + Record First Transaction
                  </Link>
                </div>
              </div>
            ) : (
              operationalInsights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      {item.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${item.tagTone.includes("emerald") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Celebrations (5/12 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-zinc-900">Celebrations</h2>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              {celebrationList.length} Recorded
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
            {celebrationList.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
                <Award className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="font-semibold text-zinc-700">No milestones recorded yet</p>
                <p className="text-[11px] text-zinc-400">
                  Maintain a positive cash flow or fund your goals this month to unlock your first celebration milestone!
                </p>
              </div>
            ) : (
              celebrationList.map((c) => (
                <div key={c.id} className="flex items-start gap-3 border-b border-zinc-100 pb-3.5 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900">{c.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-600 leading-normal">{c.message}</p>
                    <span className="mt-1 block text-[10px] font-medium text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
