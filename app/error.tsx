"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error-boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        We hit an unexpected problem on our end. Please try again.
      </p>
      <button
        onClick={reset}
        className="tap-target mt-6 rounded-xl bg-accent px-6 font-medium text-white"
      >
        Try again
      </button>
    </main>
  );
}
