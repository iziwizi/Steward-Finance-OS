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
  profiles?: { full_name?: string | null; email?: string | null };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
  profiles?: { full_name?: string | null; email?: string | null };
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

  // 3. Optional Admin Email Alert (safe best-effort)
  const adminEmail = process.env.SUPPORT_ADMIN_EMAIL || process.env.GMAIL_USER;
  if (adminEmail && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const { sendDigestEmail } = await import("@/lib/email/send");
      await sendDigestEmail(
        adminEmail,
        `[Support Ticket #${ticket.id.slice(0, 8)}] ${subject}`,
        `<p>New support ticket submitted by <strong>${user.email}</strong></p><p><strong>Category:</strong> ${category}</p><p><strong>Message:</strong></p><blockquote>${message}</blockquote><p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/support">View in Admin Console</a></p>`,
        `New support ticket by ${user.email}:\nCategory: ${category}\nMessage: ${message}`
      );
    } catch (e) {
      console.warn("Could not dispatch admin support email:", e);
    }
  }

  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true, ticketId: ticket.id };
}

export async function getUserSupportTickets() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserSupportTickets error:", error);
    return [];
  }
  return tickets ?? [];
}

export async function getSupportTicketWithMessages(ticketId: string) {
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

  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .select("*, profiles:user_id(full_name, email)")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticket) {
    throw new Error("Support ticket not found.");
  }

  // Security guard: User must own the ticket or be an admin
  if (ticket.user_id !== user.id && !isAdmin) {
    throw new Error("Unauthorized access to this support ticket.");
  }

  const { data: messages, error: msgErr } = await supabase
    .from("support_messages")
    .select("*, profiles:sender_id(full_name, email)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return {
    ticket,
    messages: messages ?? [],
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
    .select("id, user_id, subject")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticket) {
    return { success: false, error: "Ticket not found." };
  }

  // Security guard
  if (ticket.user_id !== user.id && !isAdmin) {
    return { success: false, error: "Unauthorized." };
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

  // If admin replied, send in-app notification to the ticket owner
  if (isAdmin && ticket.user_id !== user.id) {
    await supabase.from("in_app_notifications").insert({
      user_id: ticket.user_id,
      type: "system",
      title: "Support Ticket Update",
      body: `Support team replied to: "${ticket.subject}"`,
      link: `/support/${ticketId}`,
    });
  }

  revalidatePath(`/support/${ticketId}`);
  revalidatePath(`/admin/support`);
  return { success: true };
}

export async function adminUpdateTicketStatus(ticketId: string, status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed") {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/support`);
  revalidatePath(`/support/${ticketId}`);
  return { success: true };
}

export async function getAllAdminSupportTickets() {
  const { supabase } = await requireAdmin();

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllAdminSupportTickets error:", error);
    return [];
  }
  return tickets ?? [];
}
