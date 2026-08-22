import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getSenderEmail(): string {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  const fromName = process.env.EMAIL_FROM_NAME || "StewardOS";
  // Uses verified domain mujteknify.com as configured on Resend
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "notifications@mujteknify.com";
  return `${fromName} <${fromAddress}>`;
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://steward-finance-os.vercel.app";
}

/**
 * Base Email Layout wrapper with modern StewardOS branding
 */
export function wrapInStewardEmailLayout({
  previewText,
  headline,
  contentHtml,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  previewText: string;
  headline: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const appUrl = getAppBaseUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    table { border-collapse: separate; }
    .container { max-width: 580px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 800; font-size: 20px; text-decoration: none; text-align: center; line-height: 44px; }
    .brand-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #059669; margin: 12px 0 4px 0; }
    .heading { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em; line-height: 1.25; }
    .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0; }
    .cta-btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; text-align: center; transition: background-color 0.15s ease; }
    .divider { border-top: 1px solid #f1f5f9; margin: 28px 0; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; margin-top: 24px; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
  <div class="container">
    <div class="card">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="logo-badge">S</div>
        <div class="brand-title">StewardOS Personal Finance</div>
        <h1 class="heading">${headline}</h1>
      </div>

      <div class="body-text">
        ${contentHtml}
      </div>

      ${
        ctaText && ctaUrl
          ? `<div style="text-align: center; margin: 28px 0 12px 0;">
              <a href="${ctaUrl}" class="cta-btn" target="_blank">${ctaText}</a>
            </div>`
          : ""
      }

      ${
        footerNote
          ? `<p style="font-size: 11px; color: #64748b; text-align: center; margin: 16px 0 0 0;">${footerNote}</p>`
          : ""
      }
    </div>

    <div class="footer">
      <p>StewardOS · The Personal Finance Operating System for Purposeful Stewards</p>
      <p>A Product of <a href="https://mujteknify.com" target="_blank">MUJTEKNIFY</a> · © 2026 MUJTEKNIFY. All rights reserved.</p>
      <p><a href="${appUrl}/settings">Preferences</a> · <a href="${appUrl}/support">Help &amp; Support</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Universal Resend Email Dispatcher
 */
export async function sendEmailViaResend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; id?: string; error?: string; skipped?: boolean }> {
  const resend = getResendClient();

  if (!resend) {
    console.warn("[resend:sendEmail] RESEND_API_KEY is not configured — email dispatch skipped.");
    return {
      success: false,
      skipped: true,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  try {
    const from = getSenderEmail();
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || subject,
    });

    if (data.error) {
      console.error("[resend:sendEmail] Resend API error:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error("[resend:sendEmail] Exception while sending email:", err);
    return { success: false, error: err.message || "Failed to dispatch email." };
  }
}
