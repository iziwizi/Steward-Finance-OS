"use client";

import { useEffect } from "react";

/**
 * CookieSanitizer runs once in the browser on client mount.
 * It detects and deletes any bloated legacy cookies (such as old base64 avatar strings)
 * to prevent Vercel 494 REQUEST_HEADER_TOO_LARGE errors.
 */
export function CookieSanitizer() {
  useEffect(() => {
    try {
      if (typeof document === "undefined") return;

      const rawCookies = document.cookie.split("; ");
      for (const cookieStr of rawCookies) {
        const [name, ...valParts] = cookieStr.split("=");
        const val = valParts.join("=");

        // Detect bloated cookie or base64 avatar payload
        if (
          val.length > 2500 ||
          val.includes("data%3Aimage") ||
          val.includes("data:image") ||
          (name.includes("auth-token.") && !name.endsWith(".0"))
        ) {
          // If the cookie has an orphaned chunk or oversized data, purge it
          if (val.length > 2500 || val.includes("data")) {
            document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
            // Also try with domain if needed
            const hostParts = window.location.hostname.split(".");
            if (hostParts.length > 1) {
              const domain = `.${hostParts.slice(-2).join(".")}`;
              document.cookie = `${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
            }
          }
        }
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  return null;
}
