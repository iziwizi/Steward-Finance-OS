export default function AppLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-zinc-200/80 animate-pulse" />
          <div className="h-3.5 w-64 rounded-md bg-zinc-100 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-zinc-200/80 animate-pulse" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-zinc-200/70 bg-white p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-zinc-200 animate-pulse" />
              <div className="h-4 w-12 rounded-full bg-zinc-100 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-36 rounded-md bg-zinc-200/90 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-zinc-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="rounded-xl border border-zinc-200/70 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="h-4 w-40 rounded bg-zinc-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-zinc-100 animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-100 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-zinc-200 animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-zinc-100 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-24 rounded bg-zinc-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
