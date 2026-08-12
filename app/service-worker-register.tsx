"use client";

import { useEffect } from "react";

// Registered app-wide (not just from the push-notification opt-in flow) —
// installability requires an active service worker on every page, not only
// on /notifications.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
