import { InstallClient, InstallIcon } from "./install-client";

export default function InstallPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-paper px-6 py-16 text-center">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <InstallIcon />
        </div>
        <h1 className="mt-8 text-display-md text-zinc-900">Install StewardOS</h1>
        <p className="mt-3 text-[15px] leading-[22px] text-zinc-500">
          Get the full app experience. Access your finances instantly from your home screen with
          zero storage overhead.
        </p>

        <InstallClient />
      </div>
    </main>
  );
}
