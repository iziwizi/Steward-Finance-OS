"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth-state";

function friendlyLoginError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("email not confirmed")) {
    return "Please confirm your email before signing in — check your inbox for the confirmation link.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("security purposes") || m.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "We couldn't sign you in right now. Please try again.";
}

function friendlySignUpError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (m.includes("security purposes") || m.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "We couldn't create your account right now. Please try again.";
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("[auth:signUp] failed", { status: error.status, code: error.code, message: error.message });
    return { error: friendlySignUpError(error.message) };
  }

  // Email confirmation is required by this project — there's no session yet,
  // so redirecting to /dashboard would just bounce straight back to /login.
  if (!data.session) {
    return {
      error: null,
      success: "Account created! Check your email for a confirmation link, then log in.",
    };
  }

  redirect("/dashboard");
}

export async function logIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth:logIn] failed", { status: error.status, code: error.code, message: error.message });
    return { error: friendlyLoginError(error.message) };
  }

  redirect("/dashboard");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
