import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResend = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resend: mockResend,
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

const { logIn, signUp, logOut, resendConfirmation } = await import("./auth");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  mockSignInWithPassword.mockReset();
  mockSignUp.mockReset();
  mockSignOut.mockReset();
  mockResend.mockReset();
  mockRedirect.mockClear();
});

describe("logIn", () => {
  it("redirects to /dashboard on valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    await expect(
      logIn({ error: null }, formData({ email: "a@b.com", password: "secret123" }))
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });

  it("returns a friendly error for wrong credentials instead of throwing", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials", status: 400, code: "invalid_credentials" },
    });
    const result = await logIn({ error: null }, formData({ email: "a@b.com", password: "wrong" }));
    expect(result.error).toBe("Email or password is incorrect.");
  });

  it("returns a friendly error for an unconfirmed email instead of crashing", async () => {
    // This is the exact production failure: Supabase returns "Email not
    // confirmed" and the action must surface it, not throw uncaught.
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed", status: 400, code: "email_not_confirmed" },
    });
    const result = await logIn(
      { error: null },
      formData({ email: "a@b.com", password: "secret123" })
    );
    expect(result.error).toMatch(/confirm your email/i);
  });

  it("requires email and password without calling Supabase", async () => {
    const result = await logIn({ error: null }, formData({ email: "", password: "" }));
    expect(result.error).toBeTruthy();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

describe("signUp", () => {
  it("shows a check-your-email message when confirmation is required (no session yet)", async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    const result = await signUp(
      { error: null },
      formData({ email: "a@b.com", password: "secret123" })
    );
    expect(result.success).toMatch(/check a@b\.com for a confirmation link/i);
  });

  it("passes emailRedirectTo pointing at /auth/confirm on the request origin", async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    await signUp({ error: null }, formData({ email: "a@b.com", password: "secret123" }));
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { emailRedirectTo: "http://localhost:3000/auth/confirm" },
      })
    );
  });

  it("redirects to /dashboard when a session is returned immediately", async () => {
    mockSignUp.mockResolvedValue({ data: { session: {} }, error: null });
    await expect(
      signUp({ error: null }, formData({ email: "a@b.com", password: "secret123" }))
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard");
  });

  it("returns a friendly error for a duplicate account", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null },
      error: { message: "User already registered", status: 400, code: "user_already_exists" },
    });
    const result = await signUp(
      { error: null },
      formData({ email: "a@b.com", password: "secret123" })
    );
    expect(result.error).toMatch(/already exists/i);
  });
});

describe("resendConfirmation", () => {
  it("resends and reports success", async () => {
    mockResend.mockResolvedValue({ error: null });
    const result = await resendConfirmation({ error: null }, formData({ email: "a@b.com" }));
    expect(result.success).toMatch(/resent to a@b\.com/i);
    expect(mockResend).toHaveBeenCalledWith(
      expect.objectContaining({ type: "signup", email: "a@b.com" })
    );
  });

  it("returns a friendly error when rate limited", async () => {
    mockResend.mockResolvedValue({
      error: { message: "For security purposes...", status: 429, code: "over_email_send_rate_limit" },
    });
    const result = await resendConfirmation({ error: null }, formData({ email: "a@b.com" }));
    expect(result.error).toMatch(/wait a moment/i);
  });

  it("requires an email", async () => {
    const result = await resendConfirmation({ error: null }, formData({}));
    expect(result.error).toBeTruthy();
    expect(mockResend).not.toHaveBeenCalled();
  });
});

describe("logOut", () => {
  it("signs out and redirects to /login", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await expect(logOut()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockSignOut).toHaveBeenCalled();
  });
});
