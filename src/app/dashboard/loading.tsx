export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f0f0f0] animate-pulse" />
          <div>
            <div className="h-6 w-40 bg-[#f0f0f0] animate-pulse rounded-sm" />
            <div className="h-4 w-24 bg-[#f0f0f0] animate-pulse rounded-sm mt-2" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-[#e5e5e5] rounded-sm p-4">
              <div className="h-3 w-16 bg-[#f0f0f0] animate-pulse rounded-sm mb-3" />
              <div className="h-8 w-20 bg-[#f0f0f0] animate-pulse rounded-sm" />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Car stats card */}
          <div className="border border-[#e5e5e5] rounded-sm p-6">
            <div className="h-4 w-28 bg-[#f0f0f0] animate-pulse rounded-sm mb-6" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-2">
                  <div className="h-3 w-20 bg-[#f0f0f0] animate-pulse rounded-sm" />
                  <div className="h-3 w-8 bg-[#f0f0f0] animate-pulse rounded-sm" />
                </div>
                <div className="h-1 bg-[#f0f0f0] animate-pulse rounded-full" />
              </div>
            ))}
          </div>

          {/* GP card */}
          <div className="border border-[#e5e5e5] rounded-sm p-6">
            <div className="h-3 w-20 bg-[#f0f0f0] animate-pulse rounded-sm mb-3" />
            <div className="h-6 w-48 bg-[#f0f0f0] animate-pulse rounded-sm mb-2" />
            <div className="h-4 w-32 bg-[#f0f0f0] animate-pulse rounded-sm mb-6" />
            <div className="h-10 w-full bg-[#f0f0f0] animate-pulse rounded-sm" />
          </div>
        </div>

        {/* Rivals section */}
        <div className="mt-8">
          <div className="h-4 w-20 bg-[#f0f0f0] animate-pulse rounded-sm mb-4" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[180px] border border-[#e5e5e5] rounded-sm p-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0] animate-pulse mx-auto mb-3" />
                <div className="h-4 w-24 bg-[#f0f0f0] animate-pulse rounded-sm mx-auto mb-2" />
                <div className="h-6 w-12 bg-[#f0f0f0] animate-pulse rounded-sm mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
