export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <span className="text-2xl font-bold uppercase tracking-tight text-[#0a0a0a]">
        GITRACE
      </span>
      <div className="w-48 h-[2px] bg-[#f0f0f0] mt-4 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-[#0a0a0a] rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  );
}
