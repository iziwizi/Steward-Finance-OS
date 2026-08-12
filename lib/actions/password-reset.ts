"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthRedirectOrigin } from "@/lib/supabase/redirect-url";
import type { AuthActionState } from "@/lib/actions/auth-state";

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "");
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const origin = await getAuthRedirectOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin,
  });

  if (error) {
    console.error("[auth:requestPasswordReset] failed", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    if (error.message.toLowerCase().includes("security purposes") || error.status === 429) {
      return { error: "Please wait a moment before requesting another email." };
    }
    // Don't reveal whether the address has an account — same message either way.
  }

  return {
    error: null,
    success: `If an account exists for ${email}, a password reset link has been sent.`,
  };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();

  // A valid recovery session must already exist (established by /auth/confirm
  // via verifyOtp) — without it there's nothing to update.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your password reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[auth:updatePassword] failed", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return { error: "We couldn't update your password right now. Please try again." };
  }

  redirect("/dashboard");
}
