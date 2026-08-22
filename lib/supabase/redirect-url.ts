import { headers } from "next/headers";

const PRODUCTION_FALLBACK = "https://steward-finance-os.vercel.app";

/**
 * Origin to send Supabase Auth email links back to.
 * Prioritizes NEXT_PUBLIC_APP_URL, then request headers, then production domain fallback.
 */
export async function getAuthRedirectOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  try {
    const headersList = await headers();

    const origin = headersList.get("origin");
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return origin;
    }

    const host = headersList.get("host");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      const proto = headersList.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`;
    }
  } catch {
    // In background workers or environments without active headers
  }

  return PRODUCTION_FALLBACK;
}
