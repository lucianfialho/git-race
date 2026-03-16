export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-56 bg-[#f0f0f0] animate-pulse rounded-sm mb-2" />
        <div className="h-4 w-72 bg-[#f0f0f0] animate-pulse rounded-sm mb-6" />

        {/* Tab bar */}
        <div className="flex gap-4 mb-6 border-b border-[#e5e5e5] pb-3">
          <div className="h-4 w-16 bg-[#f0f0f0] animate-pulse rounded-sm" />
          <div className="h-4 w-24 bg-[#f0f0f0] animate-pulse rounded-sm" />
        </div>

        {/* Rows */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#f5f5f5] last:border-0"
            >
              <div className="h-5 w-6 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="w-8 h-8 rounded-full bg-[#f0f0f0] animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-[#f0f0f0] animate-pulse rounded-sm" />
              </div>
              <div className="h-5 w-12 bg-[#f0f0f0] animate-pulse rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
