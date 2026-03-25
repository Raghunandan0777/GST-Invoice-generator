export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-zinc-800 rounded-xl mb-2" />
          <div className="h-4 w-36 bg-zinc-800/60 rounded-lg" />
        </div>
        <div className="h-11 w-36 bg-zinc-800 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 bg-zinc-800 rounded-lg" />
              <div className="w-12 h-3 bg-zinc-800 rounded" />
            </div>
            <div className="h-7 w-32 bg-zinc-800 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-40 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-28 bg-zinc-800/60 rounded" />
            </div>
            <div className="h-7 w-28 bg-zinc-800 rounded-lg" />
          </div>
          <div className="flex items-end gap-2 h-36">
            {[60, 40, 75, 55, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-zinc-800 rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="h-5 w-32 bg-zinc-800 rounded mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 mb-1">
              <div className="w-7 h-7 bg-zinc-800 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-zinc-800 rounded mb-1" />
                <div className="h-3 w-20 bg-zinc-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between">
          <div className="h-5 w-36 bg-zinc-800 rounded" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-3.5 border-b border-zinc-800/40">
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-4 w-32 bg-zinc-800 rounded flex-1" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-6 w-16 bg-zinc-800 rounded-full" />
            <div className="h-4 w-12 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
