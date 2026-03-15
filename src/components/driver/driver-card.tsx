import type { CarStats } from "@/lib/race/car-components";
import { calculateOverallRating } from "@/lib/race/car-components";

interface DriverCardProps {
  username: string;
  avatarUrl: string;
  carNumber: number;
  division: string;
  divisionLevel: number;
  carStats: CarStats;
  totalPoints: number;
  championshipPosition?: number;
  compact?: boolean;
}

const DIVISION_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-amber-900/30", text: "text-amber-600", border: "border-amber-700/50" },
  2: { bg: "bg-neutral-600/30", text: "text-neutral-300", border: "border-neutral-500/50" },
  3: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" },
};

const STAT_CONFIG = [
  { key: "power_unit" as const, label: "PWR", color: "#ef4444" },
  { key: "aero" as const, label: "AER", color: "#3b82f6" },
  { key: "reliability" as const, label: "REL", color: "#22c55e" },
  { key: "tire_mgmt" as const, label: "TIR", color: "#a855f7" },
  { key: "strategy" as const, label: "STR", color: "#f59e0b" },
];

export function DriverCard({
  username,
  avatarUrl,
  carNumber,
  division,
  divisionLevel,
  carStats,
  totalPoints,
  championshipPosition,
  compact = false,
}: DriverCardProps) {
  const overall = calculateOverallRating(carStats);
  const divColor = DIVISION_COLORS[divisionLevel] ?? DIVISION_COLORS[1];

  if (compact) {
    return (
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-3 flex items-center gap-3">
        <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{username}</p>
          <p className="text-neutral-500 text-xs">{totalPoints} pts</p>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded ${divColor.bg} ${divColor.text} ${divColor.border} border font-bold`}>
          {division}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-neutral-900 rounded-2xl border ${divColor.border} p-6 relative overflow-hidden`}>
      {/* Overall rating badge */}
      <div className="absolute top-4 right-4 w-14 h-14 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "var(--gp-primary)" }}>
        <span className="text-lg font-black text-white">{Math.round(overall)}</span>
      </div>

      {/* Driver info */}
      <div className="flex items-center gap-4 mb-5">
        <img src={avatarUrl} alt={username} className="w-16 h-16 rounded-full border-2 border-neutral-700" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg">{username}</h3>
            <span className="text-neutral-600 font-mono text-sm">#{carNumber}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${divColor.bg} ${divColor.text} border ${divColor.border}`}>
              {division}
            </span>
            {championshipPosition && (
              <span className="text-neutral-500 text-xs">P{championshipPosition}</span>
            )}
            <span className="text-neutral-500 text-xs">{totalPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Car stats */}
      <div className="space-y-2.5">
        {STAT_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs w-8 font-mono">{label}</span>
            <div className="stat-bar flex-1">
              <div
                className="stat-bar-fill"
                style={{ width: `${carStats[key]}%`, background: color }}
              />
            </div>
            <span className="text-neutral-400 text-xs w-8 text-right font-mono">
              {Math.round(carStats[key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
