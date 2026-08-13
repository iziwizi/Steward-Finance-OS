import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRpc = vi.fn();
const mockSignOut = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser, signOut: mockSignOut },
    rpc: mockRpc,
  })),
}));

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

const { deleteAccount } = await import("./account");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  mockRpc.mockReset();
  mockSignOut.mockReset();
  mockGetUser.mockReset();
  mockRedirect.mockClear();
});

describe("deleteAccount", () => {
  it("rejects when the confirmation phrase doesn't match exactly", async () => {
    const result = await deleteAccount({ error: null }, formData({ confirmation: "delete" }));
    expect(result.error).toMatch(/type "DELETE"/i);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("calls the delete_own_account RPC, signs out, and redirects to /login on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockRpc.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });

    await expect(
      deleteAccount({ error: null }, formData({ confirmation: "DELETE" }))
    ).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(mockRpc).toHaveBeenCalledWith("delete_own_account");
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("returns a friendly error when the RPC fails, without signing out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockRpc.mockResolvedValue({ error: { code: "XX000", message: "boom" } });

    const result = await deleteAccount({ error: null }, formData({ confirmation: "DELETE" }));
    expect(result.error).toBeTruthy();
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
