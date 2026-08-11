import webpush from "web-push";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured — push sending is disabled until set.");
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:notifications@stewardos.app",
    publicKey,
    privateKey
  );
  configured = true;
}

export async function sendPushToSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; link?: string }
) {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: any) {
    // A 404/410 means the subscription is gone (user uninstalled, revoked
    // permission, etc.) — the caller is responsible for pruning it.
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      return { expired: true };
    }
    throw err;
  }
  return { expired: false };
}
