"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const institution = String(formData.get("institution") || "").trim() || null;

  if (!name) throw new Error("Account name is required.");

  const { error } = await supabase.from("accounts").insert({ user_id: user.id, name, institution });
  if (error) {
    throw new Error(
      error.code === "23505" ? "You already have an account with that name." : error.message
    );
  }

  revalidatePath("/onboarding/accounts");
  revalidatePath("/settings");
}
