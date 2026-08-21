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

export async function createAccount(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const name = String(formData.get("name") || "").trim();
    const institution = String(formData.get("institution") || "").trim() || null;

    if (!name) return { success: false, error: "Account name is required." };

    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name,
      institution,
      is_active: true,
    });

    if (error) {
      return {
        success: false,
        error: error.code === "23505" ? "An account with that name already exists." : error.message,
      };
    }

    revalidatePath("/settings");
    revalidatePath("/onboarding/accounts");
    revalidatePath("/allocations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create account." };
  }
}

export async function updateAccount(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const institution = String(formData.get("institution") || "").trim() || null;

    if (!id || !name) return { success: false, error: "Account ID and name are required." };

    const { error } = await supabase
      .from("accounts")
      .update({ name, institution, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.code === "23505" ? "An account with that name already exists." : error.message,
      };
    }

    revalidatePath("/settings");
    revalidatePath("/allocations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update account." };
  }
}

export async function deleteAccountAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const id = String(formData.get("id") || "").trim();

    if (!id) return { success: false, error: "Account ID is required." };

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/settings");
    revalidatePath("/onboarding/accounts");
    revalidatePath("/allocations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete account." };
  }
}
