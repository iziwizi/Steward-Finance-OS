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

export async function updateProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const full_name = String(formData.get("full_name") || "").trim();
    const currency = String(formData.get("currency") || "NGN").trim();
    const timezone = String(formData.get("timezone") || "Africa/Lagos").trim();

    if (!full_name) {
      return { success: false, error: "Full name is required." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        currency,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function uploadAvatar(formData: FormData): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "Please select an image file to upload." };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Avatar file size must be less than 2MB." };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const allowed = ["png", "jpg", "jpeg", "webp", "svg"];
    if (!allowed.includes(fileExt)) {
      return { success: false, error: "File must be a JPG, PNG, WEBP, or SVG image." };
    }

    let publicUrl = "";

    // 1. Try uploading to Supabase Storage
    try {
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }
    } catch (storageErr) {
      console.warn("Supabase Storage bucket upload fallback:", storageErr);
    }

    // 2. Fallback to base64 data URL if storage bucket is not configured
    if (!publicUrl) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      publicUrl = `data:${file.type || "image/png"};base64,${base64}`;
    }

    // 3. Save avatar_url to profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, avatarUrl: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload avatar." };
  }
}

export async function removeAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove avatar." };
  }
}
