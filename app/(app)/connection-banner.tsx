"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function ConnectionBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-danger px-4 py-2 text-sm font-medium text-white">
      <WifiOff className="h-4 w-4" />
      You're offline — saving a transaction now won't go through. Reconnect and try again.
    </div>
  );
}
