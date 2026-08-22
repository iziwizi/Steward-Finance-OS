import { createClient } from "@/lib/supabase/server";
import { ProgressHeader } from "../progress-header";
import { AllocationsForm } from "./allocations-form";

export default async function OnboardingAllocationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id, name, purpose, target_percent")
    .eq("user_id", user.id)
    .eq("is_income_split", true)
    .order("sort_order");

  return (
    <main className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <ProgressHeader step={3} back="/onboarding/structure" />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Define Your Allocation Envelopes
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Create your own custom budget envelopes or load a neutral starter framework. Whenever income is recorded, StewardOS will split it according to these target percentages.
            </p>
          </div>

          <AllocationsForm buckets={buckets ?? []} />
        </div>
      </div>
    </main>
  );
}
