/**
 * StewardOS — Emergency Session Repair Script
 * 
 * This script logs in as the affected user, strips the bloated base64 avatar
 * from their Supabase auth.users raw_user_meta_data, and signs them out.
 * After running this, the user can log in normally from any browser.
 * 
 * Run with: node scripts/repair-session.mjs
 */

import { createClient } from "@supabase/supabase-js";

// ─── CONFIGURATION ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://dlknryxsmggqefolcips.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Jy-B5A3e5zBi0QS08Pn2cA_GDCJiH-l";

// Fill in the affected user's credentials:
const USER_EMAIL = "REPLACE_WITH_USER_EMAIL";
const USER_PASSWORD = "REPLACE_WITH_USER_PASSWORD";
// ───────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function repairSession() {
  if (USER_EMAIL === "REPLACE_WITH_USER_EMAIL") {
    console.error("❌ Please fill in USER_EMAIL and USER_PASSWORD in the script before running.");
    process.exit(1);
  }

  console.log("🔐 Signing in as:", USER_EMAIL);
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });

  if (loginError) {
    console.error("❌ Login failed:", loginError.message);
    process.exit(1);
  }

  const user = authData?.user;
  const meta = user?.user_metadata ?? {};
  const avatarUrl = meta.avatar_url;
  const isBase64 = typeof avatarUrl === "string" && (avatarUrl.startsWith("data:") || avatarUrl.length > 500);

  console.log("\n📊 User Metadata Summary:");
  console.log("  - User ID:", user?.id);
  console.log("  - Email:", user?.email);
  console.log("  - avatar_url in metadata:", avatarUrl ? `YES (${avatarUrl.length} chars, is base64: ${isBase64})` : "None");

  if (!isBase64) {
    console.log("\n✅ No bloated avatar_url found in user metadata.");
    console.log("   The 494 error may have a different cause. Check if any other metadata field is very large:");
    console.log(JSON.stringify(meta, null, 2).substring(0, 500));
    await supabase.auth.signOut();
    process.exit(0);
  }

  console.log("\n🔧 Stripping base64 avatar_url from user metadata...");

  // Build clean metadata without avatar_url (keep everything else)
  const cleanMeta = { ...meta };
  delete cleanMeta.avatar_url;
  cleanMeta.avatar_url = null; // Explicitly null so Supabase clears it

  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    data: cleanMeta,
  });

  if (updateError) {
    console.error("❌ Failed to update user metadata:", updateError.message);
    await supabase.auth.signOut();
    process.exit(1);
  }

  const newAvatarUrl = updateData?.user?.user_metadata?.avatar_url;
  console.log("✅ Metadata updated. New avatar_url value:", newAvatarUrl ?? "null (cleared)");

  // Verify the new session JWT size
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (token) {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    const payloadSize = JSON.stringify(payload).length;
    console.log("\n📏 New JWT payload size:", payloadSize, "bytes");
    if (payloadSize < 2000) {
      console.log("✅ JWT is small enough for Vercel cookie limits.");
    } else {
      console.warn("⚠️  JWT is still large. Check the full payload:", JSON.stringify(payload, null, 2).substring(0, 500));
    }
  }

  await supabase.auth.signOut();
  console.log("\n✅ Done! The user's metadata has been cleaned.");
  console.log("   They can now log in normally from any browser — no cookie clearing needed.");
}

repairSession().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
