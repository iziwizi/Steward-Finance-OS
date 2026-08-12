"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari's own flag — not part of the standard, still widely relied on.
      (navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3 shadow-lg md:bottom-4 md:left-4 md:right-auto">
      <Download className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
      <p className="flex-1 text-sm text-ink/80">Install StewardOS for quicker access.</p>
      <button
        onClick={async () => {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setDeferredPrompt(null);
        }}
        className="tap-target rounded-lg bg-accent px-3 text-sm font-medium text-white"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="tap-target flex items-center justify-center text-ink/40"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
