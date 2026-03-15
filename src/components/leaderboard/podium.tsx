"use client";

interface PodiumEntry {
  username: string;
  avatarUrl: string;
  carColor: string;
  totalPoints: number;
}

interface PodiumProps {
  first?: PodiumEntry;
  second?: PodiumEntry;
  third?: PodiumEntry;
}

function PodiumBlock({
  entry,
  position,
  height,
}: {
  entry?: PodiumEntry;
  position: number;
  height: string;
}) {
  if (!entry) return <div className="w-32" />;

  const colors = {
    1: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/30",
    2: "from-neutral-300/20 to-neutral-300/5 border-neutral-300/30",
    3: "from-amber-600/20 to-amber-600/5 border-amber-600/30",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <img
          src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
          alt={entry.username}
          className="w-16 h-16 rounded-full border-2"
          style={{ borderColor: entry.carColor }}
        />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white">
          {position}
        </span>
      </div>
      <span className="text-white font-medium text-sm">{entry.username}</span>
      <span className="text-neutral-400 text-xs">{entry.totalPoints} pts</span>
      <div
        className={`w-28 bg-gradient-to-t border-t rounded-t-lg ${colors[position as 1 | 2 | 3]}`}
        style={{ height }}
      />
    </div>
  );
}

export function Podium({ first, second, third }: PodiumProps) {
  return (
    <div className="flex items-end justify-center gap-4 py-8">
      <PodiumBlock entry={second} position={2} height="80px" />
      <PodiumBlock entry={first} position={1} height="120px" />
      <PodiumBlock entry={third} position={3} height="60px" />
    </div>
  );
}
