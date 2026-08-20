import { Sparkles, Lightbulb, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
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
      title: "Emergency Reserve Health",
      desc: `Your available uncommitted cash (${formatNaira(
        dashboard.availableCash
      )}) is healthy and maintains positive liquidity above the critical buffer.`,
      tone: "border-brand-500 bg-brand-50/50 text-brand-900",
      badge: "Healthy",
      badgeTone: "bg-brand-100 text-brand-700",
      icon: ShieldCheck,
    },
    {
      id: "cashflow",
      title: "Net Cash Flow Position",
      desc:
        dashboard.netCashFlow >= 0
          ? `You have accumulated ${formatNaira(
              dashboard.netCashFlow
            )} in positive cash flow this month. Your savings rate is strong.`
          : `Expenses exceeded income by ${formatNaira(
              Math.abs(dashboard.netCashFlow)
            )} this month. Review pending allocations.`,
      tone:
        dashboard.netCashFlow >= 0
          ? "border-emerald-500 bg-emerald-50/50 text-emerald-950"
          : "border-rose-500 bg-rose-50/50 text-rose-950",
      badge: dashboard.netCashFlow >= 0 ? "Surplus" : "Deficit",
      badgeTone:
        dashboard.netCashFlow >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
      icon: TrendingUp,
    },
    {
      id: "allocations",
      title: "Allocation Fulfillments",
      desc:
        dashboard.allocationSummary.totalPending > 0
          ? `${formatNaira(
              dashboard.allocationSummary.totalPending
            )} in committed transfers remain pending. Complete them to finalize bucket distributions.`
          : "All planned income allocations have been fully transferred to their designated buckets.",
      tone:
        dashboard.allocationSummary.totalPending > 0
          ? "border-amber-500 bg-amber-50/50 text-amber-950"
          : "border-brand-500 bg-brand-50/50 text-brand-950",
      badge: dashboard.allocationSummary.totalPending > 0 ? "Pending Action" : "Up to Date",
      badgeTone:
        dashboard.allocationSummary.totalPending > 0
          ? "bg-amber-100 text-amber-800"
          : "bg-brand-100 text-brand-700",
      icon: AlertTriangle,
    },
    {
      id: "giving",
      title: "Kingdom Giving & Tithe",
      desc:
        dashboard.titheSummary.totalPending > 0
          ? `${formatNaira(
              dashboard.titheSummary.totalPending
            )} in tithe remains unfulfilled for current received income.`
          : "Your tithe and giving obligations are fully settled and accounted for.",
      tone: "border-blue-500 bg-blue-50/50 text-blue-950",
      badge: dashboard.titheSummary.totalPending > 0 ? "Due" : "Fulfilled",
      badgeTone:
        dashboard.titheSummary.totalPending > 0 ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Insights & Celebrations</h1>
        <p className="text-xs text-zinc-500">
          Analysis of your financial patterns combined with milestones.
        </p>
      </div>

      {/* Main 2-Column Grid matching Figma desktop-insights-celebrations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Operational Insights */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Operational Insights</h2>
            <span className="text-xs text-zinc-400">Automated Intelligence</span>
          </div>

          <div className="space-y-3.5">
            {operationalInsights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border-l-4 border-r border-t border-b border-zinc-200/80 p-4 shadow-xs ${item.tone}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <p className="text-xs font-bold">{item.title}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeTone}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-700">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Celebrations */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Celebrations</h2>
            <span className="text-xs text-zinc-400">{(celebrations ?? []).length} recorded</span>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
            {(celebrations ?? []).length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                <Sparkles className="mx-auto h-6 w-6 text-amber-500 mb-2" />
                No milestones recorded yet. As you execute your allocations and achieve savings goals, your wins will appear here.
              </div>
            ) : (
              (celebrations ?? []).map((c) => (
                <div key={c.id} className="flex items-start gap-3 border-b border-zinc-100 pb-3.5 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900">{c.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-600 leading-normal">{c.message}</p>
                    <span className="mt-1.5 block text-[10px] font-medium text-zinc-400">
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
