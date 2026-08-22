"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export async function createBucket(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const purpose = String(formData.get("purpose") || "").trim() || null;
  const target_percent = Number(formData.get("target_percent") || 0);
  const is_income_split = formData.get("is_income_split") === "on";
  const default_account_id = String(formData.get("default_account_id") || "") || null;

  if (!name) throw new Error("Bucket name is required.");

  const { count } = await supabase
    .from("budget_buckets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("budget_buckets").insert({
    user_id: user.id,
    name,
    purpose,
    target_percent,
    is_income_split,
    default_account_id,
    sort_order: count ?? 0,
  });
  if (error) {
    throw new Error(
      error.code === "23505" ? "You already have a bucket with that name." : error.message
    );
  }

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
}

export async function updateBucket(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const purpose = String(formData.get("purpose") || "").trim() || null;
  const target_percent = Number(formData.get("target_percent") || 0);
  const default_account_id = String(formData.get("default_account_id") || "") || null;

  if (!name) throw new Error("Bucket name is required.");

  const { error } = await supabase
    .from("budget_buckets")
    .update({ name, purpose, target_percent, default_account_id, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    throw new Error(
      error.code === "23505" ? "You already have a bucket with that name." : error.message
    );
  }

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
}

export async function updateBucketPurpose(bucketId: string, purpose: string) {
  const { supabase, user } = await requireUser();
  const cleanPurpose = purpose.trim() || null;

  const { error } = await supabase
    .from("budget_buckets")
    .update({ purpose: cleanPurpose, updated_at: new Date().toISOString() })
    .eq("id", bucketId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleBucketActive(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const is_active = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("budget_buckets")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
}

export async function moveBucket(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");

  const { data: buckets } = await supabase
    .from("budget_buckets")
    .select("id, sort_order")
    .eq("user_id", user.id)
    .order("sort_order");
  if (!buckets) return;

  const index = buckets.findIndex((b) => b.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= buckets.length) return;

  const a = buckets[index];
  const b = buckets[swapIndex];
  await Promise.all([
    supabase.from("budget_buckets").update({ sort_order: b.sort_order }).eq("id", a.id).eq("user_id", user.id),
    supabase.from("budget_buckets").update({ sort_order: a.sort_order }).eq("id", b.id).eq("user_id", user.id),
  ]);

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
}

export async function deleteBucket(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "");

  const { error } = await supabase.from("budget_buckets").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "This bucket has allocation history and can't be deleted — disable it instead to keep it out of new income splits."
      );
    }
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/allocations");
  revalidatePath("/dashboard");
}

export async function updateBucketTargetPercent(bucketId: string, targetPercent: number) {
  const { supabase, user } = await requireUser();
  const validPercent = Math.max(0, Math.min(100, Number(targetPercent) || 0));

  const { error } = await supabase
    .from("budget_buckets")
    .update({ target_percent: validPercent, updated_at: new Date().toISOString() })
    .eq("id", bucketId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/allocations");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}
