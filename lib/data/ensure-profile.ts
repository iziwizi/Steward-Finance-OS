import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Defends against a profile row going missing while auth.users survives
 * (e.g. manual deletion via the Supabase dashboard) — the app has no
 * account-deletion feature of its own, and email/name is never used as an
 * ownership key, only auth.uid(). ignoreDuplicates makes this a cheap
 * ON CONFLICT DO NOTHING when the profile already exists.
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
}
