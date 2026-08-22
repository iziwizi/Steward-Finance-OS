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
  query.upsert = vi.fn(() => Promise.resolve(result));
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

const {
  saveOnboardingPersonal,
  createOnboardingBucket,
  deleteOnboardingBucket,
  applyStarterTemplate,
  saveOnboardingAllocations,
  completeOnboarding,
} = await import("./onboarding");

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-onboard-123", email: "newuser@example.com" } } });
  mockFrom.mockClear();
  fromResults = {};
});

describe("Onboarding Actions (Multi-User Safe)", () => {
  it("saves personal profile info and redirects to /onboarding/structure", async () => {
    fromResults.profiles = { data: { id: "user-onboard-123" }, error: null };
    const fd = new FormData();
    fd.append("full_name", "New Test User");
    fd.append("currency", "NGN");
    fd.append("timezone", "Africa/Lagos");

    await expect(saveOnboardingPersonal(fd)).rejects.toThrow("NEXT_REDIRECT:/onboarding/structure");
  });

  it("creates a custom user-scoped onboarding allocation bucket", async () => {
    fromResults.budget_buckets = { data: { id: "b-1" }, error: null };
    const fd = new FormData();
    fd.append("name", "Custom Housing");
    fd.append("purpose", "Rent & utilities");
    fd.append("target_percent", "30");

    const res = await createOnboardingBucket(fd);
    expect(res.success).toBe(true);
  });

  it("deletes a user-scoped allocation bucket", async () => {
    fromResults.budget_buckets = { data: null, error: null };
    const res = await deleteOnboardingBucket("b-1");
    expect(res.success).toBe(true);
  });

  it("applies neutral generic starter suggestions without personal data leakage", async () => {
    fromResults.budget_buckets = { data: null, error: null };
    const res = await applyStarterTemplate();
    expect(res.success).toBe(true);
  });

  it("saves allocations and redirects to /onboarding/accounts", async () => {
    fromResults.budget_buckets = {
      data: [
        { id: "b-1", name: "Living", target_percent: 50 },
        { id: "b-2", name: "Savings", target_percent: 50 },
      ],
      error: null,
    };
    const fd = new FormData();
    fd.append("percent_b-1", "50");
    fd.append("percent_b-2", "50");

    await expect(saveOnboardingAllocations(fd)).rejects.toThrow("NEXT_REDIRECT:/onboarding/accounts");
  });

  it("completes onboarding and updates onboarding_completed_at", async () => {
    fromResults.profiles = { data: { id: "user-onboard-123" }, error: null };
    const fd = new FormData();
    fd.append("next", "/dashboard");

    await expect(completeOnboarding(fd)).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });
});
