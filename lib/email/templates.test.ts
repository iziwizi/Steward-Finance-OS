import { describe, it, expect } from "vitest";
import {
  renderWelcomeEmail,
  renderVerificationEmail,
  renderSupportCreatedEmail,
  renderSupportReplyEmail,
  renderBrandedDigestEmail,
} from "./templates";
import { getSenderEmail } from "./resend";

describe("Resend Email Templates & Branding Engine", () => {
  it("renders verified sender address with mujteknify.com domain", () => {
    const sender = getSenderEmail();
    expect(sender).toContain("mujteknify.com");
  });

  it("renders branded welcome email with correct CTA and copy", () => {
    const email = renderWelcomeEmail("Alexander");
    expect(email.subject).toContain("Welcome to StewardOS");
    expect(email.html).toContain("Alexander");
    expect(email.html).toContain("StewardOS Personal Finance");
    expect(email.html).toContain("MUJTEKNIFY");
  });

  it("renders verification email with non-localhost confirmation URL", () => {
    const confirmUrl = "https://steward-finance-os.vercel.app/auth/confirm?token=xyz";
    const email = renderVerificationEmail({ name: "Alex", confirmUrl });
    expect(email.subject).toBe("Verify your email for StewardOS");
    expect(email.html).toContain(confirmUrl);
    expect(email.html).not.toContain("localhost");
  });

  it("renders support ticket created email alert", () => {
    const email = renderSupportCreatedEmail({
      ticketId: "tick-12345678-abcd",
      userEmail: "customer@example.com",
      subject: "Cannot connect bank account",
      category: "Account Issue",
      message: "I am having trouble with bank sync.",
      adminUrl: "https://steward-finance-os.vercel.app/admin/support",
    });

    expect(email.subject).toContain("tick-123");
    expect(email.html).toContain("customer@example.com");
    expect(email.html).toContain("Cannot connect bank account");
    expect(email.html).toContain("https://steward-finance-os.vercel.app/admin/support");
  });

  it("renders support reply email notification", () => {
    const email = renderSupportReplyEmail({
      ticketId: "tick-12345678-abcd",
      ticketSubject: "Payment issue",
      replyMessage: "We have resolved the envelope sync for your account.",
      ticketUrl: "https://steward-finance-os.vercel.app/support/tick-12345678-abcd",
    });

    expect(email.subject).toContain("Payment issue");
    expect(email.html).toContain("We have resolved the envelope sync");
    expect(email.html).toContain("https://steward-finance-os.vercel.app/support/tick-12345678-abcd");
  });

  it("renders branded daily digest email with financial ledger totals", () => {
    const email = renderBrandedDigestEmail("daily_brief", {
      period_start: "2026-08-22",
      period_end: "2026-08-22",
      total_income: 150000,
      total_expenses: 25000,
      net_cash_flow: 125000,
      buckets: [],
      tithe: { planned: 15000, sent: 15000, pending: 0 },
      pending_allocations: [],
      goals: [],
      upcoming_bills: [{ name: "Electricity", amount: 12000, next_due: "2026-08-25" }],
      upcoming_subscriptions: [],
    });

    expect(email.subject).toContain("Your Daily Financial Brief");
    expect(email.html).toContain("Total Income");
    expect(email.html).toContain("Total Expenses");
  });
});
