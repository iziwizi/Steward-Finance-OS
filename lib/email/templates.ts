import { wrapInStewardEmailLayout, getAppBaseUrl } from "./resend";
import type { DigestKind, DigestPayload } from "../notifications/digest";
import { formatNaira } from "../finance/allocation-engine";

export function renderWelcomeEmail(name: string = "Valued Steward") {
  const appUrl = getAppBaseUrl();
  const subject = "Welcome to StewardOS — Master Your Financial Rhythm";
  const previewText = "Welcome to StewardOS. Take purposeful command of your wealth.";
  const headline = "Welcome to StewardOS";

  const contentHtml = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Congratulations on taking the first step toward disciplined, purposeful financial stewardship. StewardOS is engineered to give you complete clarity over every naira you earn, allocate, and disburse.</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #166534; font-size: 13px;">Your Core Rhythm:</p>
      <ul style="margin: 0; padding-left: 18px; color: #15803d; font-size: 12px; line-height: 1.6;">
        <li><strong>Record Income:</strong> Pool fresh earnings into your available balance.</li>
        <li><strong>Split into Envelopes:</strong> Automatically distribute funds to designated budget buckets.</li>
        <li><strong>Track Outflows:</strong> Disburse with confidence and peace of mind.</li>
      </ul>
    </div>

    <p>Whenever you are ready, head to your dashboard and record your first income transaction.</p>
  `;

  const html = wrapInStewardEmailLayout({
    previewText,
    headline,
    contentHtml,
    ctaText: "Open StewardOS Dashboard",
    ctaUrl: `${appUrl}/dashboard`,
  });

  return { subject, html, text: `Welcome to StewardOS, ${name}! Open your dashboard at ${appUrl}/dashboard` };
}

export function renderVerificationEmail({
  name = "Steward",
  confirmUrl,
}: {
  name?: string;
  confirmUrl: string;
}) {
  const subject = "Verify your email for StewardOS";
  const previewText = "Confirm your StewardOS account to get started.";
  const headline = "Confirm Your Email";

  const contentHtml = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for creating your StewardOS account. Please click the button below to verify your email address and activate your personal finance dashboard.</p>
    <p style="font-size: 12px; color: #64748b;">This verification link is secure and will expire in 24 hours.</p>
  `;

  const html = wrapInStewardEmailLayout({
    previewText,
    headline,
    contentHtml,
    ctaText: "Confirm Email Address",
    ctaUrl: confirmUrl,
    footerNote: `If you didn't create a StewardOS account, you can safely ignore this email.`,
  });

  return { subject, html, text: `Confirm your StewardOS email: ${confirmUrl}` };
}

export function renderSupportCreatedEmail({
  ticketId,
  userEmail,
  subject: ticketSubject,
  category,
  message,
  adminUrl,
}: {
  ticketId: string;
  userEmail: string;
  subject: string;
  category: string;
  message: string;
  adminUrl: string;
}) {
  const subject = `[Support Ticket #${ticketId.slice(0, 8)}] ${ticketSubject}`;
  const previewText = `New support ticket from ${userEmail}: ${ticketSubject}`;
  const headline = "New Customer Support Ticket";

  const contentHtml = `
    <p>A new customer support ticket has been submitted to the StewardOS Helpdesk.</p>
    
    <table style="width: 100%; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc; padding: 14px; margin: 16px 0;">
      <tr><td style="font-weight: 700; color: #64748b; width: 90px; padding: 4px 0;">User:</td><td style="font-weight: 600; color: #0f172a;">${userEmail}</td></tr>
      <tr><td style="font-weight: 700; color: #64748b; padding: 4px 0;">Category:</td><td style="color: #0f172a;">${category}</td></tr>
      <tr><td style="font-weight: 700; color: #64748b; padding: 4px 0;">Subject:</td><td style="font-weight: 700; color: #0f172a;">${ticketSubject}</td></tr>
      <tr><td style="font-weight: 700; color: #64748b; padding: 4px 0; vertical-align: top;">Message:</td><td style="color: #334155; white-space: pre-wrap;">${message}</td></tr>
    </table>
  `;

  const html = wrapInStewardEmailLayout({
    previewText,
    headline,
    contentHtml,
    ctaText: "Open in Admin Console",
    ctaUrl: adminUrl,
  });

  return { subject, html, text: `New support ticket from ${userEmail}:\nCategory: ${category}\nSubject: ${ticketSubject}\nMessage: ${message}\nOpen: ${adminUrl}` };
}

export function renderSupportReplyEmail({
  ticketId,
  ticketSubject,
  replyMessage,
  ticketUrl,
}: {
  ticketId: string;
  ticketSubject: string;
  replyMessage: string;
  ticketUrl: string;
}) {
  const subject = `[Support Update] Reply to: ${ticketSubject}`;
  const previewText = `The StewardOS support team has replied to ticket #${ticketId.slice(0, 8)}.`;
  const headline = "Support Team Reply";

  const contentHtml = `
    <p>Our engineering and customer support team has replied to your inquiry: <strong>"${ticketSubject}"</strong>.</p>
    
    <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #7e22ce;">Support Response:</p>
      <p style="margin: 0; color: #3b0764; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
    </div>

    <p>You can view the full conversation history and submit any follow-up replies directly in the StewardOS app.</p>
  `;

  const html = wrapInStewardEmailLayout({
    previewText,
    headline,
    contentHtml,
    ctaText: "View Ticket Conversation",
    ctaUrl: ticketUrl,
  });

  return { subject, html, text: `Support reply for "${ticketSubject}":\n${replyMessage}\nView at: ${ticketUrl}` };
}

export function renderBrandedDigestEmail(kind: DigestKind, payload: DigestPayload) {
  const appUrl = getAppBaseUrl();
  const dateStr = `${payload.period_start} to ${payload.period_end}`;

  const kindTitles: Record<DigestKind, string> = {
    daily_brief: "Your Daily Financial Brief",
    weekly_report: "Your Weekly Financial Review",
    monthly_report: "Your Monthly Financial Stewardship Report",
  };

  const title = kindTitles[kind];
  const subject = `[StewardOS] ${title} — ${dateStr}`;
  const previewText = `Income: ${formatNaira(payload.total_income)} · Expenses: ${formatNaira(payload.total_expenses)}`;
  const headline = title;

  const contentHtml = `
    <p>Here is your financial summary for <strong>${dateStr}</strong>:</p>
    
    <div style="display: flex; gap: 12px; margin: 20px 0;">
      <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; text-align: center;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #166534;">Total Income</div>
        <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">${formatNaira(payload.total_income)}</div>
      </div>
      <div style="flex: 1; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px; text-align: center;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #9f1239;">Total Expenses</div>
        <div style="font-size: 18px; font-weight: 800; color: #be123c; margin-top: 4px;">${formatNaira(payload.total_expenses)}</div>
      </div>
    </div>

    ${
      payload.upcoming_bills && payload.upcoming_bills.length > 0
        ? `<div style="margin: 20px 0;">
            <p style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 8px;">Upcoming Bills:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569;">
              ${payload.upcoming_bills.map((b) => `<li>${b.name}: ${formatNaira(b.amount)} (Due: ${b.next_due})</li>`).join("")}
            </ul>
          </div>`
        : ""
    }
  `;

  const html = wrapInStewardEmailLayout({
    previewText,
    headline,
    contentHtml,
    ctaText: "Open Dashboard",
    ctaUrl: `${appUrl}/dashboard`,
  });

  return { subject, html, text: `${title} (${dateStr})\nIncome: ${formatNaira(payload.total_income)}\nExpenses: ${formatNaira(payload.total_expenses)}` };
}
