import type { SupabaseClient } from "@supabase/supabase-js";
import { formatNaira } from "@/lib/finance/allocation-engine";

export type CelebrationType =
  | "first_income"
  | "first_expense"
  | "goal_milestone"
  | "goal_completed"
  | "tithe_paid"
  | "positive_cash_flow";

/**
 * Inserts a celebration if (and only if) this exact (type, related_entity)
 * hasn't already fired for this user — the unique index on the table makes
 * this safe under retries/races, no read-then-write gap. Never throws on a
 * duplicate; a celebration is a nice-to-have, not something that should
 * break the transaction it's attached to.
 */
async function award(
  supabase: SupabaseClient,
  userId: string,
  type: CelebrationType,
  title: string,
  message: string,
  relatedEntity: string = ""
) {
  try {
    const { error } = await supabase
      .from("celebrations")
      .upsert(
        { user_id: userId, type, title, message, related_entity: relatedEntity },
        { onConflict: "user_id,type,related_entity", ignoreDuplicates: true }
      );
    if (error) {
      console.error("[celebrations:award] failed", { code: error.code, message: error.message });
    }
  } catch (err) {
    console.error("[celebrations:award] unexpected error", err);
  }
}

export async function celebrateFirstIncome(supabase: SupabaseClient, userId: string) {
  await award(
    supabase,
    userId,
    "first_income",
    "First income recorded",
    "You just started tracking your money with StewardOS. That's the whole game — small win, big discipline."
  );
}

export async function celebrateFirstExpense(supabase: SupabaseClient, userId: string) {
  await award(
    supabase,
    userId,
    "first_expense",
    "First expense logged",
    "You kept track today. That's progress."
  );
}

const GOAL_MILESTONES = [25, 50, 75, 100];

export async function celebrateGoalProgress(
  supabase: SupabaseClient,
  userId: string,
  goalId: string,
  goalName: string,
  targetAmount: number,
  currentAmount: number
) {
  const progressPercent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  if (progressPercent >= 100) {
    await award(
      supabase,
      userId,
      "goal_completed",
      `Goal reached: ${goalName}`,
      `${formatNaira(targetAmount)} — done. You followed through.`,
      goalId
    );
    return;
  }

  const crossed = GOAL_MILESTONES.filter((m) => m < 100 && progressPercent >= m).sort(
    (a, b) => b - a
  )[0];
  if (crossed) {
    await award(
      supabase,
      userId,
      "goal_milestone",
      `${goalName}: ${crossed}% there`,
      `Goal progress: ${crossed}%. Keep going.`,
      `${goalId}:${crossed}`
    );
  }
}

export async function celebrateTithePaid(
  supabase: SupabaseClient,
  userId: string,
  allocationId: string,
  amount: number
) {
  await award(
    supabase,
    userId,
    "tithe_paid",
    "Tithe sent",
    `You followed through on your tithe of ${formatNaira(amount)}. Well done.`,
    allocationId
  );
}

/** Called opportunistically from the dashboard read — cheap to check, no write cost if already fired. */
export async function celebratePositiveCashFlow(
  supabase: SupabaseClient,
  userId: string,
  periodKey: string,
  netCashFlow: number
) {
  if (netCashFlow <= 0) return;
  await award(
    supabase,
    userId,
    "positive_cash_flow",
    "Positive cash flow this month",
    `Net ${formatNaira(netCashFlow)} this month. That's discipline in action.`,
    periodKey
  );
}
