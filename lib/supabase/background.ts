import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Used only by the cron route. Deliberately uses the public anon key, not
 * the service-role key — every cross-user read/write it needs goes through
 * narrowly-scoped SECURITY DEFINER Postgres functions (see migration
 * notification_rpc_functions), so the service-role key never has to exist
 * as a Vercel env var at all.
 */
export function createBackgroundClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
