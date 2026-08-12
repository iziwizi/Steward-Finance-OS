import { headers } from "next/headers";

const PRODUCTION_FALLBACK = "https://stewardos-personal-finance.vercel.app";

/**
 * Origin to send Supabase Auth email links back to, derived from the
 * incoming request. Correct for localhost in dev and the real domain in
 * production/previews with no env var to keep in sync — and it's what
 * `{{ .RedirectTo }}` resolves to in the Supabase email templates, so it
 * must be on the project's Redirect URLs allow list.
 */
export async function getAuthRedirectOrigin(): Promise<string> {
  const headersList = await headers();

  const origin = headersList.get("origin");
  if (origin) return origin;

  const host = headersList.get("host");
  if (host) {
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    return `${isLocal ? "http" : "https"}://${host}`;
  }

  return PRODUCTION_FALLBACK;
}
