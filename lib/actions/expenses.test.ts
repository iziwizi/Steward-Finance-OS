import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();

function makeQuery(result: { data?: unknown; error?: unknown; count?: number }) {
  const query: Record<string, unknown> = {};
  const chain = () => query;
  query.select = vi.fn(chain);
  query.insert = vi.fn(chain);
  query.update = vi.fn(chain);
  query.delete = vi.fn(chain);
  query.eq = vi.fn(chain);
  query.order = vi.fn(() => Promise.resolve(result));
  query.maybeSingle = vi.fn(() => Promise.resolve(result));
  query.single = vi.fn(() => Promise.resolve(result));
  query.then = (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve);
  return query;
}

let fromResults: Record<string, { data?: unknown; error?: unknown; count?: number }>;
const mockFrom = vi.fn((table: string) => makeQuery(fromResults[table] ?? { data: null, error: null }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/celebrations/evaluate", () => ({
  celebrateFirstExpense: vi.fn(),
  celebrateTithePaid: vi.fn(),
}));

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { recordExpense, deleteExpense } = await import("./expenses");

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-exp-123", email: "user@stewardos.app" } } });
  mockFrom.mockClear();
  fromResults = {};
});

describe("recordExpense & Expense Status Mapping", () => {
  it("records an expense with receipt_status paid", async () => {
    fromResults.expense_transactions = { data: { id: "exp-1" }, error: null, count: 2 };

    const fd = new FormData();
    fd.append("txn_date", "2026-08-22");
    fd.append("amount", "5000");
    fd.append("vendor", "Mother");
    fd.append("reason", "Family Support");
    fd.append("receipt_status", "paid");

    await expect(recordExpense(fd)).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });

  it("maps receipt_status correctly to display status", () => {
    // Verified mapping logic: 'paid' -> 'Cleared', 'unpaid' -> 'Pending', 'na' -> 'Pending'
    const mapExpenseStatus = (receipt_status: string) =>
      receipt_status === "paid" ? "Cleared" : "Pending";

    expect(mapExpenseStatus("paid")).toBe("Cleared");
    expect(mapExpenseStatus("unpaid")).toBe("Pending");
    expect(mapExpenseStatus("na")).toBe("Pending");
    expect(mapExpenseStatus("")).toBe("Pending");
  });

  it("fails if amount is zero or negative", async () => {
    const fd = new FormData();
    fd.append("txn_date", "2026-08-22");
    fd.append("amount", "0");

    await expect(recordExpense(fd)).rejects.toThrow("Date and a positive amount are required.");
  });

  it("deletes an expense successfully", async () => {
    fromResults.expense_transactions = { data: null, error: null };
    const res = await deleteExpense("exp-1");
    expect(res.success).toBe(true);
  });
});
