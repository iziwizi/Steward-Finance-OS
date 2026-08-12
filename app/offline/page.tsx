export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-ink">You're offline</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        StewardOS needs a connection to show your finances. Reconnect and try again.
      </p>
    </main>
  );
}
