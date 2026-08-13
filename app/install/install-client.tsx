"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STEPS = [
  "Tap the Share icon in your Safari or Chrome navigation bar.",
  'Select "Add to Home Screen" from the menu list.',
  'Confirm by tapping "Add" at the top right corner.',
];

export function InstallClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    setInstalled(isStandalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
        StewardOS is already installed on this device.
      </p>
    );
  }

  return (
    <>
      {deferredPrompt ? (
        <Button
          onClick={async () => {
            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
          className="mt-8 w-full"
        >
          Install App
        </Button>
      ) : (
        <p className="mt-8 text-center text-xs text-zinc-400">
          Your browser doesn&apos;t support one-tap install here — follow the manual steps below.
        </p>
      )}

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-[13px] font-semibold text-zinc-900">How to Install manually</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-fast ${showSteps ? "rotate-180" : ""}`}
          />
        </button>
        {showSteps && (
          <div className="mt-3 space-y-2 text-xs leading-[18px] text-zinc-500">
            {STEPS.map((step, i) => (
              <p key={step}>
                {i + 1}. {step}
              </p>
            ))}
          </div>
        )}
      </div>

      <Link href="/dashboard" className="mt-6 block text-center text-sm font-semibold text-zinc-500">
        Maybe Later
      </Link>
    </>
  );
}

export function InstallIcon() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500">
      <Target className="h-8 w-8 text-white" strokeWidth={1.75} />
    </div>
  );
}
