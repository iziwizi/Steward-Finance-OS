"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export interface DailyDecisionRecord {
  id?: string;
  decision_date: string;
  had_income: boolean;
  had_expenses: boolean;
  created_goal: boolean;
  primary_action?: string;
  completed_at?: string;
}

export async function saveDailyDecision(data: {
  had_income: boolean;
  had_expenses: boolean;
  created_goal: boolean;
  primary_action?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("daily_decisions").upsert(
      {
        user_id: user.id,
        decision_date: today,
        had_income: data.had_income,
        had_expenses: data.had_expenses,
        created_goal: data.created_goal,
        primary_action: data.primary_action || "none",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,decision_date" }
    );

    if (error) {
      console.warn("Save daily decision note:", error);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save daily check-in." };
  }
}
