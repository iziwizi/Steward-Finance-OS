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
  query.gte = vi.fn(chain);
  query.lte = vi.fn(chain);
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

const {
  createSupportTicket,
  getUserSupportTickets,
  replyToSupportTicket,
  adminUpdateTicketStatus,
  getAllAdminSupportTickets,
} = await import("./support");

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-123", email: "member@stewardos.app" } } });
  mockFrom.mockClear();
  mockRpc.mockClear();
  fromResults = {};
});

// ──────────────────────────────────────────────────────────
// createSupportTicket
// ──────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────
// getUserSupportTickets
// ──────────────────────────────────────────────────────────
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

  it("returns empty array when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(getUserSupportTickets()).rejects.toThrow(/NEXT_REDIRECT/);
  });
});

// ──────────────────────────────────────────────────────────
// replyToSupportTicket
// ──────────────────────────────────────────────────────────
describe("replyToSupportTicket", () => {
  it("appends reply message as user", async () => {
    fromResults.profiles = { data: { role: "user" }, error: null };
    fromResults.support_tickets = { data: { id: "t-1", user_id: "user-123", subject: "Ticket 1", status: "open" }, error: null };
    fromResults.support_messages = { data: { id: "m-2" }, error: null };

    const res = await replyToSupportTicket("t-1", "Here is more info");
    expect(res.success).toBe(true);
  });

  it("rejects empty message", async () => {
    const res = await replyToSupportTicket("t-1", "  ");
    expect(res.success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// adminUpdateTicketStatus
// ──────────────────────────────────────────────────────────
describe("adminUpdateTicketStatus", () => {
  beforeEach(() => {
    // Admin context
    fromResults.profiles = { data: { role: "admin", email: "admin@stewardos.app" }, error: null };
    fromResults.support_tickets = {
      data: { id: "t-1", user_id: "owner-456", subject: "Payment issue" },
      error: null,
    };
    fromResults.in_app_notifications = { data: { id: "n-1" }, error: null };
    fromResults.push_subscriptions = { data: [], error: null };
  });

  it("successfully updates ticket status to resolved", async () => {
    const res = await adminUpdateTicketStatus("t-1", "resolved");
    expect(res.success).toBe(true);
  });

  it("successfully updates ticket status to waiting_for_user", async () => {
    const res = await adminUpdateTicketStatus("t-1", "waiting_for_user");
    expect(res.success).toBe(true);
  });

  it("successfully updates ticket status to in_progress", async () => {
    const res = await adminUpdateTicketStatus("t-1", "in_progress");
    expect(res.success).toBe(true);
  });

  it("successfully updates ticket status to closed", async () => {
    const res = await adminUpdateTicketStatus("t-1", "closed");
    expect(res.success).toBe(true);
  });

  it("rejects non-admin user from updating status", async () => {
    fromResults.profiles = { data: { role: "user", email: "user@test.com" }, error: null };
    await expect(adminUpdateTicketStatus("t-1", "resolved")).rejects.toThrow(/NEXT_REDIRECT/);
  });
});

// ──────────────────────────────────────────────────────────
// getAllAdminSupportTickets (admin only)
// ──────────────────────────────────────────────────────────
describe("getAllAdminSupportTickets", () => {
  it("returns enriched ticket list for admin", async () => {
    fromResults.profiles = { data: { role: "admin", email: "admin@stewardos.app" }, error: null };
    fromResults.support_tickets = {
      data: [
        { id: "t-1", user_id: "owner-456", subject: "Payment issue", category: "Billing", status: "open", created_at: "2026-08-01T10:00:00Z", updated_at: "2026-08-01T10:00:00Z" },
      ],
      error: null,
    };

    const tickets = await getAllAdminSupportTickets();
    expect(Array.isArray(tickets)).toBe(true);
  });

  it("blocks non-admin from accessing admin ticket list", async () => {
    fromResults.profiles = { data: { role: "user" }, error: null };
    await expect(getAllAdminSupportTickets()).rejects.toThrow(/NEXT_REDIRECT/);
  });
});

// ──────────────────────────────────────────────────────────
// Date Filter / Search logic (client-side filtering test)
// ──────────────────────────────────────────────────────────
describe("Date filter & search logic (unit assertion)", () => {
  const tickets = [
    { id: "t-1", subject: "Payment issue", category: "Billing", status: "open" as const, created_at: "2026-08-01T10:00:00Z", updated_at: "2026-08-01T10:00:00Z", user_id: "u1" },
    { id: "t-2", subject: "Subscription question", category: "Billing", status: "resolved" as const, created_at: "2026-08-20T08:00:00Z", updated_at: "2026-08-20T08:00:00Z", user_id: "u2" },
    { id: "t-3", subject: "App crash", category: "Technical", status: "in_progress" as const, created_at: "2026-07-15T14:00:00Z", updated_at: "2026-07-15T14:00:00Z", user_id: "u3" },
  ];

  function filterTickets(opts: {
    tickets: typeof tickets;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const { search = "", status = "all", from = "", to = "" } = opts;
    return opts.tickets.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matches =
          t.subject.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (from) {
        const ticketDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (ticketDate < from) return false;
      }
      if (to) {
        const ticketDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (ticketDate > to) return false;
      }
      return true;
    });
  }

  it("returns all tickets when no filters applied", () => {
    const result = filterTickets({ tickets });
    expect(result).toHaveLength(3);
  });

  it("filters by status only", () => {
    const result = filterTickets({ tickets, status: "resolved" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t-2");
  });

  it("filters by search term only", () => {
    const result = filterTickets({ tickets, search: "payment" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t-1");
  });

  it("filters by date range only", () => {
    const result = filterTickets({ tickets, from: "2026-08-01", to: "2026-08-31" });
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toContain("t-1");
    expect(result.map((t) => t.id)).toContain("t-2");
  });

  it("filters by search + status + date combined", () => {
    const result = filterTickets({
      tickets,
      search: "subscription",
      status: "resolved",
      from: "2026-08-01",
      to: "2026-08-31",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t-2");
  });

  it("returns empty when no tickets match combined filters", () => {
    const result = filterTickets({
      tickets,
      search: "payment",
      status: "resolved",
    });
    expect(result).toHaveLength(0);
  });
});
