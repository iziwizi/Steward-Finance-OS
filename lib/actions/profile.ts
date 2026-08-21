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

    // 1. Update user metadata in auth.users (keep compact!)
    await supabase.auth.updateUser({
      data: { full_name },
    });

    // 2. Update profiles table
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
      console.warn("Profile update error:", error);
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function uploadAvatar(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
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
    const allowed = ["png", "jpg", "jpeg", "webp"];
    if (!allowed.includes(fileExt)) {
      return { success: false, error: "File must be a JPG, PNG, or WEBP image." };
    }

    // 1. Upload to Supabase Storage bucket 'avatars' with user-scoped path
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("[profile:uploadAvatar] storage upload error:", uploadError);
      return {
        success: false,
        error: `Could not upload image: ${uploadError.message}. Ensure the 'avatars' storage bucket is created in Supabase.`,
      };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    if (!publicUrl) {
      return { success: false, error: "Failed to generate public URL for avatar." };
    }

    // 2. Persist public URL directly into profiles table (authoritative source of truth)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("[profile:uploadAvatar] profiles table update error:", profileError);
      return {
        success: false,
        error: `Uploaded image to storage, but failed to save profile: ${profileError.message}`,
      };
    }

    // 3. Cleanse any legacy metadata
    if (user.user_metadata?.avatar_url) {
      try {
        await supabase.auth.updateUser({ data: { avatar_url: null } });
      } catch {
        // ignore non-critical metadata cleanup
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, avatarUrl: publicUrl };
  } catch (err: any) {
    console.error("[profile:uploadAvatar] unexpected error:", err);
    return { success: false, error: err.message || "Failed to upload avatar." };
  }
}

export async function removeAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();

    // 1. Cleanse metadata
    if (user.user_metadata?.avatar_url) {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
    }

    // 2. Clear from profiles table
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("[profile:removeAvatar] error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove avatar." };
  }
}
