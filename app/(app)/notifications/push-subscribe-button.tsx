"use client";

import { useEffect, useState, useTransition } from "react";
import { savePushSubscription, sendTestPushNotification } from "@/lib/actions/notifications";
import { Bell, CheckCircle2, AlertCircle, Loader2, Send, Check } from "lucide-react";
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
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [isPendingTest, startTransitionTest] = useTransition();

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
    setTestFeedback(null);
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
      if (Notification.permission === "granted") {
        setStatus("subscribed");
      } else {
        setErrorMessage(err.message || "Could not register push notifications.");
        setStatus("idle");
      }
    }
  }

  function handleSendTest() {
    setTestFeedback(null);
    setErrorMessage(null);

    startTransitionTest(async () => {
      const res = await sendTestPushNotification();
      if (res.success) {
        setTestFeedback("Test notification dispatched to your active device!");
        setTimeout(() => setTestFeedback(null), 5000);
      } else {
        setErrorMessage(res.error || "Failed to dispatch test notification.");
      }
    });
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
        Push notifications are not supported on this browser or platform.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Device Push Notifications</h3>
            <p className="text-[11px] text-zinc-400">
              Receive immediate alerts for pending bill due dates and allocation disbursement reminders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {status === "subscribed" ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Enabled
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={isPendingTest}
                onClick={handleSendTest}
                className="px-3 py-1 text-xs"
              >
                {isPendingTest ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5 text-brand-600" />
                )}
                <span>Send Test</span>
              </Button>
            </>
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
      </div>

      {testFeedback && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{testFeedback}</span>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
      )}

      {status === "denied" && (
        <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
          Notifications are blocked in your browser settings. To enable device alerts, allow notifications for this domain in your browser site permissions.
        </p>
      )}
    </div>
  );
}
