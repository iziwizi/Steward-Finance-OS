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

export async function createOnboardingBucket(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const purpose = String(formData.get("purpose") || "").trim();
  const target_percent = Number(formData.get("target_percent") || 0);

  if (!name) {
    return { success: false, error: "Bucket name is required." };
  }

  const { error } = await supabase.from("budget_buckets").insert({
    user_id: user.id,
    name,
    purpose: purpose || null,
    target_percent,
    is_income_split: true,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/onboarding/allocations");
  return { success: true };
}

export async function deleteOnboardingBucket(bucketId: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("budget_buckets")
    .delete()
    .eq("id", bucketId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/onboarding/allocations");
  return { success: true };
}

export async function applyStarterTemplate() {
  const { supabase, user } = await requireUser();

  // Neutral, standard 50/30/20 budget framework starter envelopes
  const GENERIC_STARTER_BUCKETS = [
    { name: "Living Essentials", purpose: "Housing, groceries, utilities, transit", target_percent: 50, sort_order: 1 },
    { name: "Future & Savings", purpose: "Emergency reserve, investments, growth", target_percent: 20, sort_order: 2 },
    { name: "Giving & Fellowship", purpose: "Tithe, charity, family support", target_percent: 15, sort_order: 3 },
    { name: "Personal Lifestyle", purpose: "Recreation, shopping, dining", target_percent: 15, sort_order: 4 },
  ];

  for (const b of GENERIC_STARTER_BUCKETS) {
    await supabase.from("budget_buckets").upsert(
      {
        user_id: user.id,
        name: b.name,
        purpose: b.purpose,
        target_percent: b.target_percent,
        is_income_split: true,
        sort_order: b.sort_order,
      },
      { onConflict: "user_id,name" }
    );
  }

  revalidatePath("/onboarding/allocations");
  return { success: true };
}

export async function saveOnboardingAllocations(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_income_split", true);

  if (buckets && buckets.length > 0) {
    await Promise.all(
      buckets.map((b) => {
        const raw = formData.get(`percent_${b.id}`);
        if (raw === null) return Promise.resolve();
        return supabase
          .from("budget_buckets")
          .update({ target_percent: Number(raw) })
          .eq("id", b.id)
          .eq("user_id", user.id);
      })
    );
  }

  redirect("/onboarding/accounts");
}

const ALLOWED_NEXT = new Set(["/onboarding/complete", "/income/new", "/expenses/new", "/dashboard"]);

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
