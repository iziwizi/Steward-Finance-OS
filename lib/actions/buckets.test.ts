import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();

// A minimal chainable query builder stub: every method returns `this` except
// the ones configured to resolve/reject via `resolve`.
function makeQuery(result: { data?: unknown; error?: unknown; count?: number }) {
  const query: Record<string, unknown> = {};
  const chain = () => query;
  query.select = vi.fn(chain);
  query.insert = vi.fn(chain);
  query.update = vi.fn(chain);
  query.delete = vi.fn(chain);
  query.eq = vi.fn(chain);
  query.order = vi.fn(() => Promise.resolve(result));
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

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createBucket, deleteBucket, moveBucket } = await import("./buckets");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mockFrom.mockClear();
  fromResults = {};
});

describe("createBucket", () => {
  it("requires a name", async () => {
    fromResults.budget_buckets = { count: 0, error: null };
    await expect(createBucket(formData({ name: "" }))).rejects.toThrow(/name is required/i);
  });

  it("surfaces a friendly error for a duplicate bucket name", async () => {
    fromResults.budget_buckets = { error: { code: "23505", message: "duplicate key" } };
    await expect(createBucket(formData({ name: "Tithe" }))).rejects.toThrow(/already have a bucket/i);
  });
});

describe("deleteBucket", () => {
  it("surfaces a friendly error when allocations reference the bucket (FK restrict)", async () => {
    fromResults.budget_buckets = { error: { code: "23503", message: "violates foreign key" } };
    await expect(deleteBucket(formData({ id: "b1" }))).rejects.toThrow(/disable it instead/i);
  });

  it("succeeds when nothing references the bucket", async () => {
    fromResults.budget_buckets = { error: null };
    await expect(deleteBucket(formData({ id: "b1" }))).resolves.toBeUndefined();
  });
});

describe("moveBucket", () => {
  it("does nothing when already at the top and moving up", async () => {
    fromResults.budget_buckets = {
      data: [
        { id: "b1", sort_order: 0 },
        { id: "b2", sort_order: 1 },
      ],
      error: null,
    };
    await moveBucket(formData({ id: "b1", direction: "up" }));
    // Only the initial select().order() read — no update() calls issued.
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });
});
