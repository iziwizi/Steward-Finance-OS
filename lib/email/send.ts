import { sendEmailViaResend } from "./resend";
import nodemailer from "nodemailer";

/**
 * Universal Email Sender for StewardOS
 * Primary Provider: Resend (via RESEND_API_KEY & verified mujteknify.com sender)
 * Fallback Provider: Gmail SMTP (if RESEND_API_KEY is omitted)
 */
export async function sendDigestEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  // 1. If RESEND_API_KEY is configured, dispatch via Resend
  if (process.env.RESEND_API_KEY) {
    const res = await sendEmailViaResend({ to, subject, html, text });
    if (res.success) return { success: true };
    console.warn("[email:send] Resend send failed, attempting fallback if configured:", res.error);
  }

  // 2. Fallback to Gmail SMTP if Gmail credentials are provided
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (user && pass) {
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
      const fromName = process.env.EMAIL_FROM_NAME || "StewardOS";
      await transport.sendMail({
        from: `${fromName} <${user}>`,
        to,
        subject,
        html,
        text,
      });
      return { success: true };
    } catch (e: any) {
      console.error("[email:send] Gmail SMTP error:", e);
      return { success: false, error: e.message };
    }
  }

  // 3. No email providers configured
  console.warn("[email:send] Neither RESEND_API_KEY nor GMAIL credentials are configured.");
  return { success: false, error: "No email provider configured in environment variables." };
}

export { sendEmailViaResend } from "./resend";
export * from "./templates";
