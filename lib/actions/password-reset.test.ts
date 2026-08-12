import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/supabase/redirect-url", () => ({
  getAuthRedirectOrigin: vi.fn(async () => "http://localhost:3000"),
}));

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

const { requestPasswordReset, updatePassword } = await import("./password-reset");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  mockResetPasswordForEmail.mockReset();
  mockUpdateUser.mockReset();
  mockGetUser.mockReset();
  mockRedirect.mockClear();
});

describe("requestPasswordReset", () => {
  it("reports success without revealing whether the account exists", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const result = await requestPasswordReset({ error: null }, formData({ email: "a@b.com" }));
    expect(result.success).toMatch(/a@b\.com/);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith("a@b.com", {
      redirectTo: "http://localhost:3000",
    });
  });

  it("still reports success even when Supabase errors, so account existence isn't leaked", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "user not found", status: 400 },
    });
    const result = await requestPasswordReset({ error: null }, formData({ email: "a@b.com" }));
    expect(result.success).toBeTruthy();
    expect(result.error).toBeFalsy();
  });

  it("surfaces a friendly message when rate limited", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "for security purposes...", status: 429 },
    });
    const result = await requestPasswordReset({ error: null }, formData({ email: "a@b.com" }));
    expect(result.error).toMatch(/wait a moment/i);
  });

  it("requires an email", async () => {
    const result = await requestPasswordReset({ error: null }, formData({}));
    expect(result.error).toBeTruthy();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });
});

describe("updatePassword", () => {
  it("rejects when there's no recovery session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await updatePassword(
      { error: null },
      formData({ password: "newpassword123", confirmPassword: "newpassword123" })
    );
    expect(result.error).toMatch(/expired/i);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const result = await updatePassword(
      { error: null },
      formData({ password: "newpassword123", confirmPassword: "different123" })
    );
    expect(result.error).toMatch(/match/i);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("rejects a too-short password", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const result = await updatePassword(
      { error: null },
      formData({ password: "short", confirmPassword: "short" })
    );
    expect(result.error).toMatch(/8 characters/i);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("updates the password and redirects to /dashboard on success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockUpdateUser.mockResolvedValue({ error: null });
    await expect(
      updatePassword(
        { error: null },
        formData({ password: "newpassword123", confirmPassword: "newpassword123" })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard");
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpassword123" });
  });
});
