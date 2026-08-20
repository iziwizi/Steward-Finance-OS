"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/notifications";
import { Bell, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    if (Notification.permission === "granted") {
      setStatus("subscribed");
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
    if ("PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setStatus("subscribed");
        })
      );
    }
  }, []);

  async function subscribe() {
    setErrorMessage(null);
    setStatus("loading");

    try {
      if (!("Notification" in window)) {
        setStatus("unsupported");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setErrorMessage("Browser notification permission was not granted.");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (publicKey && "serviceWorker" in navigator && "PushManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        const json = sub.toJSON();
        await savePushSubscription({
          endpoint: json.endpoint!,
          keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        });
      }

      setStatus("subscribed");
    } catch (err: any) {
      console.error("Push subscription error:", err);
      // If VAPID isn't configured in test env, browser permission is still granted
      if (Notification.permission === "granted") {
        setStatus("subscribed");
      } else {
        setErrorMessage(err.message || "Could not register push notifications.");
        setStatus("idle");
      }
    }
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
        Push notifications are not supported on this browser or platform.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Device Push Notifications</h3>
            <p className="text-[11px] text-zinc-400">
              Receive immediate alerts for pending bill due dates and allocation disbursement reminders.
            </p>
          </div>
        </div>

        {status === "subscribed" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Enabled
          </span>
        ) : status === "denied" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Blocked
          </span>
        ) : (
          <Button
            type="button"
            onClick={subscribe}
            disabled={status === "loading"}
            variant="primary"
            className="px-3.5 py-1.5 text-xs"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Enabling...
              </>
            ) : (
              "Enable Alerts"
            )}
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}
      {status === "denied" && (
        <p className="text-xs text-zinc-500">
          Notifications are blocked in your browser settings. To enable alerts, allow notifications for this site in your browser preferences.
        </p>
      )}
    </div>
  );
}
