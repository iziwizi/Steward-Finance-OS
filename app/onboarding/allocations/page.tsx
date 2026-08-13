import { createClient } from "@/lib/supabase/server";
import { ProgressHeader } from "../progress-header";
import { AllocationsForm } from "./allocations-form";

export default async function OnboardingAllocationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id, name, target_percent")
    .eq("user_id", user!.id)
    .eq("is_income_split", true)
    .order("sort_order");

  return (
    <main className="min-h-dvh bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <ProgressHeader step={3} back="/onboarding/structure" />
        <h1 className="mt-8 text-display-md text-zinc-900">Set your allocations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Customize how your incoming income is distributed. These are starter defaults — rename,
          add, or remove buckets any time from Settings.
        </p>

        <AllocationsForm buckets={buckets ?? []} />
      </div>
    </main>
  );
}
