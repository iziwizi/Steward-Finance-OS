import { describe, it, expect, vi } from "vitest";
import { ensureProfile } from "./ensure-profile";

function makeSupabaseStub(upsertResult: { error: unknown }) {
  const upsert = vi.fn(async () => upsertResult);
  return { from: vi.fn(() => ({ upsert })), _upsert: upsert };
}

describe("ensureProfile", () => {
  it("upserts the user's own profile with id/email, ignoring duplicates", async () => {
    const supabase = makeSupabaseStub({ error: null });
    const user = { id: "u1", email: "a@b.com" };

    // @ts-expect-error - minimal stub, not a real SupabaseClient
    await ensureProfile(supabase, user);

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(supabase._upsert).toHaveBeenCalledWith(
      { id: "u1", email: "a@b.com", notification_email: "a@b.com" },
      { onConflict: "id", ignoreDuplicates: true }
    );
  });

  it("logs rather than throws when the upsert fails", async () => {
    const supabase = makeSupabaseStub({ error: { code: "42501", message: "denied" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // @ts-expect-error - minimal stub, not a real SupabaseClient
    await expect(ensureProfile(supabase, { id: "u1", email: "a@b.com" })).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
