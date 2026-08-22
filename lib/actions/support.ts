"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./admin";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
  sender_name?: string | null;
}

export async function createSupportTicket(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subject = String(formData.get("subject") || "").trim();
  const category = String(formData.get("category") || "General Support").trim();
  const message = String(formData.get("message") || "").trim();

  if (!subject || !message) {
    return { success: false, error: "Subject and message are required." };
  }

  // 1. Create ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      category,
      status: "open",
    })
    .select()
    .single();

  if (ticketErr || !ticket) {
    return { success: false, error: ticketErr?.message || "Failed to create support ticket." };
  }

  // 2. Insert initial message
  const { error: msgErr } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    sender_role: "user",
    message,
  });

  if (msgErr) {
    console.error("Support message error:", msgErr);
  }

  // 3. Admin Email Alert
  const adminEmail = process.env.SUPPORT_ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS || "mujteknify@gmail.com";
  try {
    const { sendDigestEmail, renderSupportCreatedEmail } = await import("../email/send");
    const { getAppBaseUrl } = await import("../email/resend");
    const adminUrl = `${getAppBaseUrl()}/admin/support`;
    const emailData = renderSupportCreatedEmail({
      ticketId: ticket.id,
      userEmail: user.email || "User",
      subject,
      category,
      message,
      adminUrl,
    });
    await sendDigestEmail(adminEmail, emailData.subject, emailData.html, emailData.text);
  } catch (e) {
    console.warn("Could not dispatch admin support email:", e);
  }

  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true, ticketId: ticket.id };
}

export async function getUserSupportTickets(): Promise<SupportTicket[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, category, status, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getUserSupportTickets error:", error);
    return [];
  }
  return (tickets ?? []) as SupportTicket[];
}

export async function getSupportTicketWithMessages(ticketId: string): Promise<{
  ticket: SupportTicket;
  messages: SupportMessage[];
  currentUser: { id: string; isAdmin: boolean };
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if current user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  // Fetch ticket (no join — avoids FK requirement)
  const { data: ticketRaw, error: ticketErr } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, category, status, created_at, updated_at")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticketRaw) {
    throw new Error("Support ticket not found or access denied.");
  }

  // Security guard: User must own the ticket or be an admin
  if (ticketRaw.user_id !== user.id && !isAdmin) {
    throw new Error("Unauthorized access to this support ticket.");
  }

  // Fetch ticket owner profile for admin view
  let user_name: string | null = null;
  let user_email: string | null = null;
  if (isAdmin && ticketRaw.user_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", ticketRaw.user_id)
      .maybeSingle();
    user_name = ownerProfile?.full_name ?? null;
    user_email = ownerProfile?.email ?? null;
  }

  const ticket: SupportTicket = {
    ...(ticketRaw as any),
    user_name,
    user_email,
  };

  // Fetch messages (no join — avoids FK requirement)
  const { data: messagesRaw, error: msgErr } = await supabase
    .from("support_messages")
    .select("id, ticket_id, sender_id, sender_role, message, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (msgErr) {
    console.error("getSupportTicketWithMessages messages error:", msgErr);
  }

  // Enrich messages with sender names via separate profile lookups
  const messages: SupportMessage[] = await Promise.all(
    (messagesRaw ?? []).map(async (m: any) => {
      let sender_name: string | null = null;
      if (m.sender_role === "admin") {
        sender_name = "StewardOS Support";
      } else {
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", m.sender_id)
          .maybeSingle();
        sender_name = senderProfile?.full_name ?? null;
      }
      return { ...m, sender_name };
    })
  );

  return {
    ticket,
    messages,
    currentUser: { id: user.id, isAdmin },
  };
}

export async function replyToSupportTicket(ticketId: string, messageContent: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const message = messageContent.trim();
  if (!message) {
    return { success: false, error: "Message cannot be empty." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticket) {
    return { success: false, error: "Ticket not found." };
  }

  // Security guard
  if (ticket.user_id !== user.id && !isAdmin) {
    return { success: false, error: "Unauthorized." };
  }

  if (ticket.status === "closed") {
    return { success: false, error: "This ticket is closed and cannot receive new replies." };
  }

  const sender_role = isAdmin ? "admin" : "user";

  const { error: msgErr } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_role,
    message,
  });

  if (msgErr) {
    return { success: false, error: msgErr.message };
  }

  // Update ticket timestamp and status
  const nextStatus = isAdmin ? "waiting_for_user" : "in_progress";
  await supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString(), status: nextStatus })
    .eq("id", ticketId);

  // If admin replied, send in-app notification and email to the ticket owner
  if (isAdmin && ticket.user_id !== user.id) {
    await supabase.from("in_app_notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: "Support Ticket Update",
      body: `Support team replied to: "${ticket.subject}"`,
      link: `/support/${ticketId}`,
    });

    // Best-effort push notification to ticket owner
    try {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key")
        .eq("user_id", ticket.user_id);

      if (subs && subs.length > 0) {
        const { sendPushToSubscription } = await import("../push/send");
        for (const s of subs) {
          const res = await sendPushToSubscription(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
            {
              title: "Support Reply",
              body: `StewardOS replied to: "${ticket.subject}"`,
              link: `/support/${ticketId}`,
            }
          ).catch(() => null);
          if (res?.expired) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
        }
      }
    } catch (e) {
      console.warn("Could not dispatch push to ticket owner:", e);
    }

    // Best-effort email to ticket owner
    try {
      const { data: ticketOwner } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", ticket.user_id)
        .maybeSingle();

      const userEmail = ticketOwner?.email;
      if (userEmail) {
        const { sendDigestEmail, renderSupportReplyEmail } = await import("../email/send");
        const { getAppBaseUrl } = await import("../email/resend");
        const ticketUrl = `${getAppBaseUrl()}/support/${ticketId}`;
        const emailData = renderSupportReplyEmail({
          ticketId,
          ticketSubject: ticket.subject,
          replyMessage: message,
          ticketUrl,
        });
        await sendDigestEmail(userEmail, emailData.subject, emailData.html, emailData.text);
      }
    } catch (e) {
      console.warn("Could not dispatch customer reply email:", e);
    }
  }

  revalidatePath(`/support/${ticketId}`);
  revalidatePath(`/admin/support`);
  return { success: true };
}

export async function adminUpdateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed"
) {
  const { supabase, user } = await requireAdmin();

  // Fetch ticket to notify owner
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject")
    .eq("id", ticketId)
    .single();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify ticket owner about status change
  if (ticket && ticket.user_id !== user.id) {
    let bodyText = `Your support ticket "${ticket.subject}" status was updated to ${status}.`;
    if (status === "waiting_for_user") {
      bodyText = `Your support ticket status was updated to Waiting for User.`;
    } else if (status === "resolved") {
      bodyText = `Your support ticket has been marked as resolved.`;
    } else if (status === "in_progress") {
      bodyText = `Your support ticket is now In Progress.`;
    } else if (status === "closed") {
      bodyText = `Your support ticket has been closed.`;
    }

    await supabase.from("in_app_notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: "Support Ticket Status Updated",
      body: bodyText,
      link: `/support/${ticketId}`,
    });

    // Best-effort push notification
    try {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key")
        .eq("user_id", ticket.user_id);

      if (subs && subs.length > 0) {
        const { sendPushToSubscription } = await import("../push/send");
        for (const s of subs) {
          const res = await sendPushToSubscription(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
            {
              title: "Ticket Status Updated",
              body: bodyText,
              link: `/support/${ticketId}`,
            }
          ).catch(() => null);
          if (res?.expired) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
        }
      }
    } catch (e) {
      console.warn("Could not dispatch push notification for status update:", e);
    }
  }

  revalidatePath(`/admin/support`);
  revalidatePath(`/support/${ticketId}`);
  return { success: true };
}

export async function getAllAdminSupportTickets(): Promise<SupportTicket[]> {
  const { supabase } = await requireAdmin();

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, category, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getAllAdminSupportTickets error:", error);
    return [];
  }

  // Enrich each ticket with user info via separate profile lookups
  const enriched = await Promise.all(
    (tickets ?? []).map(async (t: any) => {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", t.user_id)
        .maybeSingle();
      return {
        ...t,
        user_name: ownerProfile?.full_name ?? null,
        user_email: ownerProfile?.email ?? null,
      };
    })
  );

  return enriched as SupportTicket[];
}
