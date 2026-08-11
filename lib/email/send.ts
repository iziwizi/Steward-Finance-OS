import nodemailer from "nodemailer";

/**
 * Sends through the user's own Gmail account via SMTP + an App Password.
 * This is the "Option 1 — Google/Gmail" path from the brief: no new domain,
 * no Resend, sender is the real Gmail address. An App Password (not the
 * account password, not full OAuth) is the simplest reliable server-side
 * mechanism — generated once in Google Account → Security → App Passwords
 * (requires 2-Step Verification to be on). Never exposed to the client;
 * read only from server-only env vars.
 */
function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not configured — email sending is disabled until set."
    );
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendDigestEmail(to: string, subject: string, html: string, text: string) {
  const transport = getTransport();
  await transport.sendMail({
    from: `StewardOS <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}
