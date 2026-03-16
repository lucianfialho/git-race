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

const DIVISION_BADGE: Record<number, string> = {
  1: "badge-f3",
  2: "badge-f2",
  3: "badge-f1",
};

const STAT_CONFIG = [
  { key: "power_unit" as const, label: "Power Unit", color: "#0a0a0a" },
  { key: "aero" as const, label: "Aerodynamics", color: "#0a0a0a" },
  { key: "reliability" as const, label: "Reliability", color: "#0a0a0a" },
  { key: "tire_mgmt" as const, label: "Tire Mgmt", color: "#0a0a0a" },
  { key: "strategy" as const, label: "Strategy", color: "#0a0a0a" },
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
  const badgeClass = DIVISION_BADGE[divisionLevel] ?? "badge-f3";

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e5e5]">
        <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full" />
        <div className="flex-1 min-w-0">
          <p className="text-[#0a0a0a] text-sm font-bold truncate">{username}</p>
          <p className="text-[#a3a3a3] text-xs">{totalPoints} pts</p>
        </div>
        <span className={`px-1.5 py-0.5 rounded ${badgeClass}`}>{division}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt={username} className="w-14 h-14 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#0a0a0a]">{username}</h3>
              <span className="text-[#a3a3a3] font-mono text-sm">#{carNumber}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded ${badgeClass}`}>{division}</span>
              {championshipPosition && <span className="text-[#525252] text-xs">P{championshipPosition}</span>}
              <span className="text-[#a3a3a3] text-xs">{totalPoints} pts</span>
            </div>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
          <span className="text-xl font-black text-[#0a0a0a]">{Math.round(overall)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {STAT_CONFIG.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-[#525252] text-xs w-20">{label}</span>
            <div className="stat-bar flex-1">
              <div className="stat-bar-fill bg-[#0a0a0a]" style={{ width: `${carStats[key]}%` }} />
            </div>
            <span className="text-[#0a0a0a] text-xs w-8 text-right font-bold">{Math.round(carStats[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
