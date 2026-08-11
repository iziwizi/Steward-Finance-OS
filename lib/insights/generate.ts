import { formatNaira } from "@/lib/finance/allocation-engine";

export type InsightInput = {
  currentIncome: number;
  previousIncome: number;
  currentExpenses: number;
  previousExpenses: number;
  currentPending: number;
  previousPending: number;
  currentTithePending: number;
};

/**
 * Every insight here is a direct, checkable comparison against the user's
 * own previous-period numbers — no inferred advice, no claims the data
 * can't support. Returns nothing rather than a weak/misleading insight
 * when the underlying numbers are too close to call.
 */
export function generateInsights(input: InsightInput): string[] {
  const insights: string[] = [];
  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : null;

  const expensePct = pctChange(input.currentExpenses, input.previousExpenses);
  if (expensePct !== null && Math.abs(expensePct) >= 10) {
    insights.push(
      expensePct > 0
        ? `Spending is up ${Math.round(expensePct)}% from last month.`
        : `Spending is down ${Math.round(Math.abs(expensePct))}% from last month.`
    );
  }

  const incomePct = pctChange(input.currentIncome, input.previousIncome);
  if (incomePct !== null && Math.abs(incomePct) >= 10) {
    insights.push(
      incomePct > 0
        ? `Income increased ${Math.round(incomePct)}% from last month.`
        : `Income dropped ${Math.round(Math.abs(incomePct))}% from last month.`
    );
  }

  if (input.currentPending > input.previousPending && input.previousPending >= 0) {
    const delta = input.currentPending - input.previousPending;
    if (delta > 0) {
      insights.push(`Pending allocations grew by ${formatNaira(delta)} since last month.`);
    }
  }

  if (input.currentTithePending > 0) {
    insights.push(`Outstanding tithe: ${formatNaira(input.currentTithePending)}.`);
  }

  const currentSavingsRate =
    input.currentIncome > 0
      ? ((input.currentIncome - input.currentExpenses) / input.currentIncome) * 100
      : null;
  const previousSavingsRate =
    input.previousIncome > 0
      ? ((input.previousIncome - input.previousExpenses) / input.previousIncome) * 100
      : null;
  if (currentSavingsRate !== null && previousSavingsRate !== null) {
    const delta = currentSavingsRate - previousSavingsRate;
    if (delta >= 5) {
      insights.push(`Your savings rate improved by ${Math.round(delta)} percentage points.`);
    }
  }

  return insights;
}
