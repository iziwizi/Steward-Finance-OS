import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Always uses the public anon key + the caller's session
 * cookie — RLS enforces per-user isolation. The service-role key is never
 * imported here or anywhere client-reachable; it's reserved for the
 * server-only scheduled-job scripts (email digests, migration import).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no write access — the
            // middleware below refreshes the session instead.
          }
        },
      },
    }
  );
}
