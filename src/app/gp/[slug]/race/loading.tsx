export default function RaceLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Dark header */}
      <section className="bg-[#0a0a0a]">
        <div className="h-1 bg-[#f0f0f0] opacity-20" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
          <div className="h-3 w-20 bg-white/10 animate-pulse rounded-sm mb-3" />
          <div className="h-8 w-56 bg-white/10 animate-pulse rounded-sm mb-2" />
          <div className="h-4 w-40 bg-white/10 animate-pulse rounded-sm" />
        </div>
      </section>

      {/* Results table */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="h-3 w-16 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="flex-1" />
            <div className="h-3 w-10 bg-[#e5e5e5] animate-pulse rounded-sm" />
            <div className="h-3 w-8 bg-[#e5e5e5] animate-pulse rounded-sm" />
          </div>

          {/* Rows */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#f0f0f0] last:border-0"
            >
              <div className="h-5 w-6 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="w-7 h-7 rounded-full bg-[#f0f0f0] animate-pulse" />
              <div className="h-4 w-28 bg-[#f0f0f0] animate-pulse rounded-sm flex-1" />
              <div className="h-3 w-14 bg-[#f0f0f0] animate-pulse rounded-sm" />
              <div className="h-4 w-8 bg-[#f0f0f0] animate-pulse rounded-sm" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
