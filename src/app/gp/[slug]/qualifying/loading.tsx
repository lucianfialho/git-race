export default function QualifyingLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="h-3 w-36 bg-[#f0f0f0] animate-pulse rounded-sm mb-2" />
          <div className="h-7 w-56 bg-[#f0f0f0] animate-pulse rounded-sm mb-2" />
          <div className="h-4 w-40 bg-[#f0f0f0] animate-pulse rounded-sm" />
        </div>

        {/* Q1/Q2/Q3 tabs */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-14 bg-[#f0f0f0] animate-pulse rounded-sm" />
          ))}
        </div>

        {/* Table */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="h-3 w-16 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="flex-1" />
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm hidden sm:block" />
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm hidden sm:block" />
          </div>

          {/* Rows */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-2.5 border-b border-[#f5f5f5] last:border-0"
            >
              <div className="h-4 w-6 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="w-6 h-6 rounded-full bg-[#f0f0f0] animate-pulse" />
              <div className="h-4 w-28 bg-[#f0f0f0] animate-pulse rounded-sm flex-1" />
              <div className="h-3 w-14 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="h-3 w-14 bg-[#f0f0f0] animate-pulse rounded-sm hidden sm:block" />
              <div className="h-3 w-14 bg-[#f0f0f0] animate-pulse rounded-sm hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
