"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth-state";

export async function deleteAccount(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const confirmation = String(formData.get("confirmation") || "");
  if (confirmation !== "DELETE") {
    return { error: 'Type "DELETE" exactly to confirm.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    console.error("[account:deleteAccount] failed", { code: error.code, message: error.message });
    return { error: "We couldn't delete your account right now. Please try again." };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
