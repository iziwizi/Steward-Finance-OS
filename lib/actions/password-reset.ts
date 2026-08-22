"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthRedirectOrigin } from "@/lib/supabase/redirect-url";
import type { AuthActionState } from "@/lib/actions/auth-state";

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const origin = await getAuthRedirectOrigin();
  const resetRedirectUrl = `${origin}/auth/confirm?type=recovery`;

  // 1. Trigger Supabase password recovery
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetRedirectUrl,
  });

  if (error) {
    console.error("[auth:requestPasswordReset] Supabase reset error:", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    if (error.message.toLowerCase().includes("security purposes") || error.status === 429) {
      return { error: "Please wait a moment before requesting another email." };
    }
  }

  // 2. If service role key is configured, generate a direct action link and dispatch via Resend
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${origin}/reset-password`,
        },
      });

      if (!linkErr && linkData?.properties?.action_link) {
        const { sendDigestEmail, renderPasswordResetEmail } = await import("../email/send");
        const resetUrl = linkData.properties.action_link;
        const emailContent = renderPasswordResetEmail({
          name: email.split("@")[0],
          resetUrl,
        });
        await sendDigestEmail(email, emailContent.subject, emailContent.html, emailContent.text);
      }
    } catch (adminErr) {
      console.warn("[auth:requestPasswordReset] Admin direct email dispatch fallback error:", adminErr);
    }
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

  return { error: null, success: "Your password has been changed successfully." };
}
