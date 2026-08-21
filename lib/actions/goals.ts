"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { celebrateGoalProgress } from "@/lib/celebrations/evaluate";

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const bucket_id = String(formData.get("bucket_id") || "") || null;
  const priority = String(formData.get("priority") || "");
  const target_amount = Number(formData.get("target_amount") || 0);
  const current_amount = Number(formData.get("current_amount") || 0);
  const target_date = String(formData.get("target_date") || "") || null;

  if (!name || !target_amount || target_amount <= 0) {
    throw new Error("Name and a positive target amount are required.");
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user!.id,
    name,
    category,
    bucket_id,
    priority,
    target_amount,
    current_amount,
    target_date,
    status: current_amount >= target_amount ? "completed" : current_amount > 0 ? "in_progress" : "not_started",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/goals");
  redirect("/goals");
}

/** Bound directly as a <form action> in goals/page.tsx, so this must return void. */
export async function contributeToGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const goal_id = String(formData.get("goal_id") || "");
  const amount = Number(formData.get("amount") || 0);
  const contributed_at = String(formData.get("contributed_at") || new Date().toISOString().slice(0, 10));

  if (!goal_id || !amount || amount <= 0) {
    throw new Error("A positive amount is required.");
  }

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("name, current_amount, target_amount")
    .eq("id", goal_id)
    .eq("user_id", user!.id)
    .single();
  if (goalError || !goal) throw new Error("Goal not found.");

  const newAmount = Number(goal.current_amount) + amount;

  const { error: contribError } = await supabase.from("goal_contributions").insert({
    user_id: user!.id,
    goal_id,
    amount,
    contributed_at,
  });
  if (contribError) throw new Error(contribError.message);

  const { error: updateError } = await supabase
    .from("goals")
    .update({
      current_amount: newAmount,
      status: newAmount >= Number(goal.target_amount) ? "completed" : "in_progress",
      completion_date:
        newAmount >= Number(goal.target_amount) ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", goal_id)
    .eq("user_id", user!.id);
  if (updateError) throw new Error(updateError.message);

  await celebrateGoalProgress(
    supabase,
    user!.id,
    goal_id,
    goal.name,
    Number(goal.target_amount),
    newAmount
  );

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/celebrations");
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const category = String(formData.get("category") || "");
  const target_amount = Number(formData.get("target_amount") || 0);
  const current_amount = Number(formData.get("current_amount") || 0);
  const target_date = String(formData.get("target_date") || "") || null;

  if (!id || !name || !target_amount || target_amount <= 0) {
    throw new Error("Name and target amount are required.");
  }

  const { error } = await supabase
    .from("goals")
    .update({
      name,
      category,
      target_amount,
      current_amount,
      target_date,
      status: current_amount >= target_amount ? "completed" : current_amount > 0 ? "in_progress" : "not_started",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
