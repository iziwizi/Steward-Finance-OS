import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

const { updateSession } = await import("./middleware");

beforeEach(() => {
  mockGetUser.mockReset();
});

describe("updateSession", () => {
  it("redirects unauthenticated users away from protected routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(new NextRequest("http://localhost:3000/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("lets unauthenticated users reach /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await updateSession(new NextRequest("http://localhost:3000/login"));
    expect(res.status).toBe(200);
  });

  it("redirects authenticated users away from /login to /dashboard", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSession(new NextRequest("http://localhost:3000/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("lets authenticated users through to protected routes (session persists)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await updateSession(new NextRequest("http://localhost:3000/dashboard"));
    expect(res.status).toBe(200);
  });
});
