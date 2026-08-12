import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side exchange of a Supabase email link's token_hash for a session.
 * Requires the project's "Confirm signup" and "Reset Password" email
 * templates to link here as `{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=...`
 * instead of the default `{{ .ConfirmationURL }}` — see ENV_SETUP.md.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = type === "recovery" ? "/reset-password" : "/dashboard";

  // Strip the one-time token from the URL before it's ever shown in a browser bar.
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(redirectTo);
}
