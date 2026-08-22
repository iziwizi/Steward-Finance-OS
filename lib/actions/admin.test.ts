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
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { requireAdmin, getAdminUsersList, setUserRoleAction } = await import("./admin");

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1", email: "admin@stewardos.app" } } });
  mockFrom.mockClear();
  mockRpc.mockClear();
  fromResults = {};
});

describe("requireAdmin", () => {
  it("redirects non-logged-in user to /admin-login", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(requireAdmin()).rejects.toThrow(/NEXT_REDIRECT:\/admin-login/);
  });

  it("redirects non-admin user to /admin-login", async () => {
    fromResults.profiles = { data: { role: "user", email: "normal@user.com" }, error: null };
    await expect(requireAdmin()).rejects.toThrow(/NEXT_REDIRECT:\/admin-login/);
  });

  it("allows admin user to proceed", async () => {
    fromResults.profiles = { data: { role: "admin", email: "admin@stewardos.app" }, error: null };
    const res = await requireAdmin();
    expect(res.user.id).toBe("admin-1");
    expect(res.profile.role).toBe("admin");
  });
});

describe("getAdminUsersList", () => {
  it("returns user list when authorized", async () => {
    fromResults.profiles = { data: { role: "admin", email: "admin@stewardos.app" }, error: null };
    mockRpc.mockResolvedValueOnce({
      data: [
        { id: "u1", email: "user1@test.com", role: "user" },
        { id: "u2", email: "admin@test.com", role: "admin" },
      ],
      error: null,
    });

    const users = await getAdminUsersList();
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("user1@test.com");
  });
});

describe("setUserRoleAction", () => {
  it("updates user role", async () => {
    fromResults.profiles = { data: { role: "admin", email: "admin@stewardos.app" }, error: null };
    const res = await setUserRoleAction("u1", "admin");
    expect(res).toEqual({ success: true });
  });
});
