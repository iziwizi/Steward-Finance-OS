import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle2, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatNaira } from "@/lib/finance/allocation-engine";

export default async function CelebrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: celebrations }, dashboard] = await Promise.all([
    supabase
      .from("celebrations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(50),
    getDashboardData("current_month"),
  ]);

  // Operational Insights matching Figma desktop-insights-celebrations
  const operationalInsights = [
    {
      id: "emergency",
      category: "SAVINGS",
      tag: "+15% vs target",
      tagTone: "text-emerald-700 font-bold",
      title: "Emergency Cushion Met",
      desc: `You have built out an Emergency Fund equivalent to 4.2 months of standard operating expenditures. Good cushion depth.`,
      borderTone: "border-l-emerald-500",
    },
    {
      id: "dining",
      category: "FOOD & DELIVERY",
      tag: "Spend alert",
      tagTone: "text-amber-700 font-bold",
      title: "Unusually High Dining Out",
      desc: "Spend spike across restaurants and food delivery apps in Lagos island. Currently ₦42,000 over seasonal averages.",
      borderTone: "border-l-amber-500",
    },
    {
      id: "grocery",
      category: "STAT OF MONTH",
      tag: "No action required",
      tagTone: "text-blue-700 font-bold",
      title: "Primary Outlet: Grocery",
      desc: "Your transactions with grocery merchants accounted for 42.1% of total outflows, trailing standard target parameters.",
      borderTone: "border-l-blue-500",
    },
    {
      id: "subs",
      category: "SUBSCRIPTIONS",
      tag: "Saved ₦12,400/mo",
      tagTone: "text-emerald-700 font-bold",
      title: "Clean Slate Subscriptions",
      desc: "Four unused premium trial accounts have been successfully identified and pruned, preventing ₦12,400 in leakages.",
      borderTone: "border-l-emerald-500",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Figma desktop-insights-celebrations */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Insights & Celebrations</h1>
          <p className="text-xs text-zinc-500">
            Analysis of your financial patterns combined with milestones.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-insights-celebrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Operational Insights (7/12 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Operational Insights</h2>
          </div>

          <div className="space-y-3.5">
            {operationalInsights.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border-l-4 border-r border-t border-b border-zinc-200/80 bg-white p-4 shadow-xs ${item.borderTone}`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-zinc-400">
                    {item.category}
                  </span>
                  <span className={item.tagTone}>{item.tag}</span>
                </div>
                <h3 className="mt-1.5 text-xs font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Celebrations (5/12 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Celebrations</h2>
              <p className="text-[10px] text-zinc-400">Positive signals and milestones achieved.</p>
            </div>
            <span className="text-xs text-zinc-400 font-semibold">{(celebrations ?? []).length} Recorded</span>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
            {(celebrations ?? []).length === 0 ? (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Debt Free Milestone</p>
                    <p className="text-[11px] text-zinc-600">Cleared the balance on auto repair line ahead of schedule.</p>
                    <span className="text-[10px] font-semibold text-emerald-700">+150 Credit Depth</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Consecutive Days Saved</p>
                    <p className="text-[11px] text-zinc-600">Maintained a 14-day streak of not exceeding daily lunch parameters.</p>
                    <span className="text-[10px] font-semibold text-emerald-700">Streak Master</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Zero Overdraft Month</p>
                    <p className="text-[11px] text-zinc-600">Finished the mid-quarter cycles without a single facility charge.</p>
                    <span className="text-[10px] font-semibold text-emerald-700">+50 Stewardship</span>
                  </div>
                </div>
              </div>
            ) : (
              (celebrations ?? []).map((c) => (
                <div key={c.id} className="flex items-start gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
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
