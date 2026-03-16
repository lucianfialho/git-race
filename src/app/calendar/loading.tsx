export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-40 bg-[#f0f0f0] animate-pulse rounded-sm mb-2" />
        <div className="h-4 w-64 bg-[#f0f0f0] animate-pulse rounded-sm mb-8" />

        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-sm border border-[#e5e5e5]"
            >
              <div className="h-4 w-6 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="w-7 h-7 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-36 bg-[#f0f0f0] animate-pulse rounded-sm mb-1" />
                <div className="h-3 w-48 bg-[#f0f0f0] animate-pulse rounded-sm" />
              </div>
              <div className="h-5 w-16 bg-[#f0f0f0] animate-pulse rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
