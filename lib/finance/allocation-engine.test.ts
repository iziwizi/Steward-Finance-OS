import { describe, it, expect } from "vitest";
import {
  calculateIncomeAllocations,
  summarizeAllocations,
  calculateNetCashFlow,
  calculateAvailableCash,
  calculateBudgetHealth,
  calculateGoalProgress,
  calculateAllocationProgress,
  formatCompactNaira,
  resolvePeriod,
  type Bucket,
} from "./allocation-engine";

const stewardOsBuckets: Bucket[] = [
  { id: "tithe", name: "Tithe", targetPercent: 10, isIncomeSplit: true },
  { id: "living", name: "Living Expenses", targetPercent: 50, isIncomeSplit: true },
  { id: "future", name: "Future Martins", targetPercent: 15, isIncomeSplit: true },
  { id: "freedom", name: "Freedom Fund", targetPercent: 10, isIncomeSplit: true },
  { id: "kingdom", name: "Kingdom Giving", targetPercent: 8, isIncomeSplit: true },
  { id: "mother", name: "Mother", targetPercent: 4, isIncomeSplit: true },
  { id: "lifestyle", name: "Lifestyle", targetPercent: 2, isIncomeSplit: true },
  { id: "misc", name: "Miscellaneous", targetPercent: 1, isIncomeSplit: true },
  { id: "rent", name: "Rent Fund", targetPercent: 0, isIncomeSplit: false },
];

describe("calculateIncomeAllocations", () => {
  it("matches the real StewardOS sheet for a ₦240,000 salary", () => {
    const result = calculateIncomeAllocations(240000, stewardOsBuckets);
    const byName = Object.fromEntries(result.map((r) => [r.bucketName, r.plannedAmount]));
    expect(byName["Tithe"]).toBe(24000);
    expect(byName["Living Expenses"]).toBe(120000);
    expect(byName["Future Martins"]).toBe(36000);
    expect(byName["Freedom Fund"]).toBe(24000);
    expect(byName["Kingdom Giving"]).toBe(19200);
    expect(byName["Mother"]).toBe(9600);
    expect(byName["Lifestyle"]).toBe(4800);
    expect(byName["Miscellaneous"]).toBe(2400);
    expect(byName["Rent Fund"]).toBeUndefined(); // excluded from auto-split, matches the sheet
  });

  it("matches the sheet for a ₦7,000 sale (fractional kobo case)", () => {
    const result = calculateIncomeAllocations(7000, stewardOsBuckets);
    const byName = Object.fromEntries(result.map((r) => [r.bucketName, r.plannedAmount]));
    expect(byName["Tithe"]).toBe(700);
    expect(byName["Living Expenses"]).toBe(3500);
    expect(byName["Future Martins"]).toBe(1050);
    expect(byName["Freedom Fund"]).toBe(700);
    expect(byName["Kingdom Giving"]).toBe(560);
    expect(byName["Mother"]).toBe(280);
    expect(byName["Lifestyle"]).toBe(140);
    expect(byName["Miscellaneous"]).toBe(70);
  });

  it("always reconciles exactly to the income amount, even with rounding", () => {
    const amount = 12345.67;
    const result = calculateIncomeAllocations(amount, stewardOsBuckets);
    const sum = result.reduce((s, r) => s + r.plannedAmount, 0);
    expect(Math.round(sum * 100)).toBe(Math.round(amount * 100));
  });
});

describe("summarizeAllocations — planned vs sent vs pending", () => {
  it("never counts a pending allocation as sent", () => {
    const records = [
      { bucketId: "tithe", bucketName: "Tithe", plannedAmount: 24000, status: "sent" as const },
      { bucketId: "living", bucketName: "Living Expenses", plannedAmount: 120000, status: "pending" as const },
      { bucketId: "future", bucketName: "Future Martins", plannedAmount: 36000, status: "pending" as const },
    ];
    const summary = summarizeAllocations(records);
    expect(summary.totalPlanned).toBe(180000);
    expect(summary.totalSent).toBe(24000);
    expect(summary.totalPending).toBe(156000);
  });
});

describe("calculateNetCashFlow", () => {
  it("matches the July dashboard snapshot: ₦19,000 income, ₦2,200 expenses", () => {
    expect(calculateNetCashFlow({ totalIncome: 19000, totalExpenses: 2200 })).toBe(16800);
  });
});

describe("calculateAvailableCash", () => {
  it("subtracts expenses and SENT allocations only — pending money stays available", () => {
    // ₦240,000 income, ₦23,200 expenses, ₦24,000 tithe actually sent,
    // the remaining ₦216,000 in other allocations still pending.
    const available = calculateAvailableCash({
      totalIncome: 240000,
      totalExpenses: 23200,
      totalSentAllocations: 24000,
    });
    expect(available).toBe(192800);
  });
});

describe("calculateBudgetHealth", () => {
  it("flags a bucket as warning once 90% spent", () => {
    const [health] = calculateBudgetHealth([
      { bucketId: "living", bucketName: "Living Expenses", allocated: 10000, spent: 9500 },
    ]);
    expect(health.available).toBe(500);
    expect(health.percentUsed).toBe(95);
    expect(health.warning).toBe(true);
  });
});

describe("calculateGoalProgress", () => {
  it("matches the Rent Fund goal: ₦100,000 of ₦1,500,000", () => {
    const { remaining, progressPercent } = calculateGoalProgress(1500000, 100000);
    expect(remaining).toBe(1400000);
    expect(progressPercent).toBeCloseTo(6.7, 1);
  });

  it("safely handles 0 target amount", () => {
    const { remaining, progressPercent } = calculateGoalProgress(0, 5000);
    expect(remaining).toBe(0);
    expect(progressPercent).toBe(0);
  });
});

describe("calculateAllocationProgress", () => {
  it("computes 0% progress when sent is 0", () => {
    const { planned, sent, remaining, progressPercent } = calculateAllocationProgress(10000, 0);
    expect(planned).toBe(10000);
    expect(sent).toBe(0);
    expect(remaining).toBe(10000);
    expect(progressPercent).toBe(0);
  });

  it("computes 50% when half sent", () => {
    const { remaining, progressPercent } = calculateAllocationProgress(10000, 5000);
    expect(remaining).toBe(5000);
    expect(progressPercent).toBe(50);
  });

  it("caps at 100% when sent exceeds planned", () => {
    const { remaining, progressPercent } = calculateAllocationProgress(10000, 12000);
    expect(remaining).toBe(0);
    expect(progressPercent).toBe(100);
  });
});

describe("formatCompactNaira", () => {
  it("formats billions and trillions cleanly", () => {
    expect(formatCompactNaira(2_000_000_000)).toBe("₦2.00B");
    expect(formatCompactNaira(2_000_000_000_000)).toBe("₦2.00T");
    expect(formatCompactNaira(15_500_000)).toBe("₦15.50M");
  });
});

describe("resolvePeriod", () => {
  it("resolves current_month correctly", () => {
    const now = new Date("2026-08-11T12:00:00Z");
    const { start, end } = resolvePeriod("current_month", now);
    expect(start).toBe("2026-08-01");
    expect(end).toBe("2026-08-31");
  });
});
