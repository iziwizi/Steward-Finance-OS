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

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createSupportTicket, getUserSupportTickets, replyToSupportTicket } = await import("./support");

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-123", email: "member@stewardos.app" } } });
  mockFrom.mockClear();
  fromResults = {};
});

describe("createSupportTicket", () => {
  it("creates ticket with open status", async () => {
    fromResults.support_tickets = { data: { id: "t-1", subject: "Help with envelopes" }, error: null };
    fromResults.support_messages = { data: { id: "m-1" }, error: null };

    const fd = new FormData();
    fd.append("subject", "Help with envelopes");
    fd.append("category", "General Support");
    fd.append("message", "I want to split into 4 envelopes.");

    const res = await createSupportTicket(fd);
    expect(res.success).toBe(true);
    expect(res.ticketId).toBe("t-1");
  });

  it("fails if subject or message is empty", async () => {
    const fd = new FormData();
    fd.append("subject", "");
    fd.append("message", "");

    const res = await createSupportTicket(fd);
    expect(res.success).toBe(false);
    expect(res.error).toBe("Subject and message are required.");
  });
});

describe("getUserSupportTickets", () => {
  it("fetches tickets for authenticated user", async () => {
    fromResults.support_tickets = {
      data: [{ id: "t-1", subject: "Ticket 1", status: "open" }],
      error: null,
    };

    const tickets = await getUserSupportTickets();
    expect(tickets).toHaveLength(1);
    expect(tickets[0].id).toBe("t-1");
  });
});

describe("replyToSupportTicket", () => {
  it("appends reply message", async () => {
    fromResults.profiles = { data: { role: "user" }, error: null };
    fromResults.support_tickets = { data: { id: "t-1", user_id: "user-123", subject: "Ticket 1" }, error: null };
    fromResults.support_messages = { data: { id: "m-2" }, error: null };

    const res = await replyToSupportTicket("t-1", "Here is more info");
    expect(res.success).toBe(true);
  });
});
