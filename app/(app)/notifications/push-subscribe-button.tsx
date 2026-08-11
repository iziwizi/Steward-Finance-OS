"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushSubscribeButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported" | "denied">(
    "idle"
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setStatus("subscribed");
      })
    );
  }, []);

  async function subscribe() {
    setStatus("loading");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setStatus("unsupported");
      return;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const json = sub.toJSON();
    await savePushSubscription({
      endpoint: json.endpoint!,
      keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
    });
    setStatus("subscribed");
  }

  if (status === "unsupported") return null;
  if (status === "subscribed") {
    return (
      <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
        Push notifications enabled on this device
      </p>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === "loading"}
      className="tap-target w-full rounded-xl border border-ink/15 bg-white text-sm font-medium"
    >
      {status === "denied"
        ? "Notifications blocked — enable in browser settings"
        : "Enable push notifications on this device"}
    </button>
  );
}
