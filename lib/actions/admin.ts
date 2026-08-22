"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, profile };
}

export async function getAdminUsersList() {
  const { supabase, user } = await requireAdmin();

  // Try RPC first, fallback to direct query with service role / authenticated admin query
  const { data: rpcUsers, error: rpcError } = await supabase.rpc("list_admin_users");
  if (!rpcError && rpcUsers) {
    return rpcUsers;
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at, updated_at, onboarding_completed_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminUsersList error:", error);
    return [];
  }

  return profiles ?? [];
}

export async function setUserRoleAction(targetUserId: string, newRole: "user" | "admin") {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
