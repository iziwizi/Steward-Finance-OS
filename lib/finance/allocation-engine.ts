/**
 * StewardOS financial calculation engine.
 *
 * This module is the single source of truth for money math. UI components
 * and server actions call into this — they never compute allocations,
 * cash-flow, or budget figures themselves. Deterministic, unit-testable,
 * no I/O.
 *
 * All money values are handled as integer minor units (kobo) internally to
 * avoid floating-point drift, and only formatted to Naira at the edges.
 */

export type Bucket = {
  id: string;
  name: string;
  targetPercent: number; // e.g. 10 for 10%
  isIncomeSplit: boolean; // false = goal-funded bucket like Rent Fund, excluded from auto-split
};

export type AllocationStatus = "pending" | "sent";

export type PlannedAllocation = {
  bucketId: string;
  bucketName: string;
  plannedAmount: number; // in Naira (2dp), derived from integer kobo math
};

export type AllocationRecord = PlannedAllocation & {
  status: AllocationStatus;
  sentAt?: string | null;
};

const toKobo = (naira: number) => Math.round(naira * 100);
const toNaira = (kobo: number) => Math.round(kobo) / 100;

/**
 * Splits an income amount across all income-split buckets according to
 * their target percentages. Remainder kobo (from rounding) is assigned to
 * the largest bucket so the sum always reconciles exactly to the input
 * amount — this matters for financial correctness, not just cosmetics.
 */
export function calculateIncomeAllocations(
  incomeAmount: number,
  buckets: Bucket[]
): PlannedAllocation[] {
  const splitBuckets = buckets.filter((b) => b.isIncomeSplit && b.targetPercent > 0);
  if (splitBuckets.length === 0) return [];

  const totalKobo = toKobo(incomeAmount);
  const rawShares = splitBuckets.map((b) => ({
    bucket: b,
    exact: (totalKobo * b.targetPercent) / 100,
  }));

  const floored = rawShares.map((s) => ({
    bucket: s.bucket,
    kobo: Math.floor(s.exact),
    remainder: s.exact - Math.floor(s.exact),
  }));

  let allocatedKobo = floored.reduce((sum, f) => sum + f.kobo, 0);
  let leftoverKobo = totalKobo - allocatedKobo;

  // Distribute leftover kobo (rounding dust) to the buckets with the
  // largest fractional remainder first — standard largest-remainder method.
  const byRemainderDesc = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < byRemainderDesc.length && leftoverKobo > 0; i++) {
    byRemainderDesc[i].kobo += 1;
    leftoverKobo -= 1;
  }

  return floored.map((f) => ({
    bucketId: f.bucket.id,
    bucketName: f.bucket.name,
    plannedAmount: toNaira(f.kobo),
  }));
}

export type AllocationSummary = {
  totalPlanned: number;
  totalSent: number;
  totalPending: number;
};

/** Never report pending money as sent — this is the whole point of the feature. */
export function summarizeAllocations(records: AllocationRecord[]): AllocationSummary {
  const totalPlanned = records.reduce((s, r) => s + r.plannedAmount, 0);
  const totalSent = records
    .filter((r) => r.status === "sent")
    .reduce((s, r) => s + r.plannedAmount, 0);
  const totalPending = totalPlanned - totalSent;
  return { totalPlanned, totalSent, totalPending };
}

export type CashFlowInput = {
  totalIncome: number;
  totalExpenses: number;
};

export function calculateNetCashFlow({ totalIncome, totalExpenses }: CashFlowInput): number {
  return toNaira(toKobo(totalIncome) - toKobo(totalExpenses));
}

/**
 * The single number that answers "how much of this money is actually mine
 * to spend right now?" — gross income, minus what's already gone out as
 * expenses, minus allocations that have actually been sent. Money sitting
 * in a *pending* allocation is still physically in the account, so it is
 * NOT subtracted here — it's reported separately as a committed obligation
 * so the user sees it without the dashboard silently spending it for them.
 */
export function calculateAvailableCash(input: {
  totalIncome: number;
  totalExpenses: number;
  totalSentAllocations: number;
}): number {
  const kobo =
    toKobo(input.totalIncome) - toKobo(input.totalExpenses) - toKobo(input.totalSentAllocations);
  return toNaira(kobo);
}

export type BudgetLine = {
  bucketId: string;
  bucketName: string;
  targetPercent?: number;
  allocated: number; // total planned into this bucket for the period
  sent?: number; // total marked as sent/disbursed for the period
  spent: number; // total expenses tagged to this bucket for the period
};

export type BudgetHealth = BudgetLine & {
  available: number;
  sentAmount: number;
  remainingAmount: number;
  fundingProgress: number; // 0-100% funding progress (sent / allocated)
  percentUsed: number; // 0-100+, expense ratio (spent / allocated)
  warning: boolean; // true once percentUsed >= 90
};

export function calculateAllocationProgress(planned: number, sent: number) {
  const safePlanned = Number(planned) || 0;
  const safeSent = Number(sent) || 0;
  const remaining = Math.max(0, toNaira(toKobo(safePlanned) - toKobo(safeSent)));
  const progressPercent =
    safePlanned > 0 ? Math.min(100, Math.round((safeSent / safePlanned) * 100)) : 0;
  return {
    planned: safePlanned,
    sent: safeSent,
    remaining,
    progressPercent,
  };
}

export function calculateBudgetHealth(lines: BudgetLine[]): BudgetHealth[] {
  return lines.map((line) => {
    const safeAllocated = Number(line.allocated) || 0;
    const safeSent = Number(line.sent ?? 0);
    const safeSpent = Number(line.spent) || 0;
    const available = toNaira(toKobo(safeAllocated) - toKobo(safeSpent));
    const percentUsed = safeAllocated > 0 ? (safeSpent / safeAllocated) * 100 : 0;
    const allocProgress = calculateAllocationProgress(safeAllocated, safeSent);

    return {
      ...line,
      available,
      sentAmount: safeSent,
      remainingAmount: allocProgress.remaining,
      fundingProgress: allocProgress.progressPercent,
      percentUsed: Math.round(percentUsed * 10) / 10,
      warning: percentUsed >= 90,
    };
  });
}

export function calculateGoalProgress(targetAmount: number, currentAmount: number) {
  const progressPercent =
    targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
  return {
    remaining: toNaira(Math.max(0, toKobo(targetAmount) - toKobo(currentAmount))),
    progressPercent: Math.round(progressPercent * 10) / 10,
  };
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Reporting period resolution — used by dashboard, reports, and emails alike. */
export type PeriodPreset =
  | "current_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "last_30_days"
  | "last_90_days"
  | "all_time"
  | "custom";

export function resolvePeriod(
  preset: PeriodPreset,
  now: Date = new Date(),
  custom?: { start: string; end: string }
): { start: string; end: string } {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case "current_month":
      return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
    case "last_month":
      return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
    case "this_quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return { start: iso(new Date(y, qStart, 1)), end: iso(new Date(y, qStart + 3, 0)) };
    }
    case "last_quarter": {
      const qStart = Math.floor(m / 3) * 3 - 3;
      return { start: iso(new Date(y, qStart, 1)), end: iso(new Date(y, qStart + 3, 0)) };
    }
    case "this_year":
      return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
    case "last_year":
      return { start: iso(new Date(y - 1, 0, 1)), end: iso(new Date(y - 1, 11, 31)) };
    case "last_30_days":
      return { start: iso(new Date(now.getTime() - 30 * 86400000)), end: iso(now) };
    case "last_90_days":
      return { start: iso(new Date(now.getTime() - 90 * 86400000)), end: iso(now) };
    case "all_time":
      return { start: "1970-01-01", end: iso(new Date(y + 1, 0, 0)) };
    case "custom":
      if (!custom) throw new Error("custom period requires start/end");
      return custom;
  }
}
