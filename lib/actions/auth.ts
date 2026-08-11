"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) throw new Error("Email and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  redirect("/dashboard");
}

export async function logIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) throw new Error("Email and password are required.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Incorrect email or password.");

  redirect("/dashboard");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
