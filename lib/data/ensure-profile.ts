import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Defends against a profile row going missing while auth.users survives
 * (e.g. manual deletion via the Supabase dashboard).
 * Also automatically cleanses any legacy base64 avatar strings from
 * raw_user_meta_data to prevent 494 REQUEST_HEADER_TOO_LARGE cookie bloat.
 */
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email, notification_email: user.email },
      { onConflict: "id", ignoreDuplicates: true }
    );

  if (error) {
    console.error("[profile:ensureProfile] failed", { code: error.code, message: error.message });
  }

  // Self-healing: if user_metadata has a legacy oversized base64 avatar URL (>500 chars),
  // strip it from auth.users metadata immediately to prevent cookie header overflow.
  const legacyAvatar = (user.user_metadata as any)?.avatar_url;
  if (typeof legacyAvatar === "string" && (legacyAvatar.startsWith("data:") || legacyAvatar.length > 500)) {
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
    } catch {
      // ignore
    }
  }
}
