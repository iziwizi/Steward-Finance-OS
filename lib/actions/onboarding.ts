"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export async function saveOnboardingPersonal(formData: FormData) {
  const { supabase, user } = await requireUser();
  const full_name = String(formData.get("full_name") || "").trim();
  const currency = String(formData.get("currency") || "NGN");
  const timezone = String(formData.get("timezone") || "Africa/Lagos");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name || null, currency, timezone })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  redirect("/onboarding/structure");
}

export async function saveOnboardingAllocations(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_income_split", true);

  await Promise.all(
    (buckets ?? []).map((b) => {
      const raw = formData.get(`percent_${b.id}`);
      if (raw === null) return Promise.resolve();
      return supabase
        .from("budget_buckets")
        .update({ target_percent: Number(raw) })
        .eq("id", b.id)
        .eq("user_id", user.id);
    })
  );

  redirect("/onboarding/accounts");
}

const ALLOWED_NEXT = new Set(["/onboarding/complete", "/income/new", "/expenses/new"]);

export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  const requested = String(formData.get("next") || "/onboarding/complete");
  redirect(ALLOWED_NEXT.has(requested) ? requested : "/onboarding/complete");
}
