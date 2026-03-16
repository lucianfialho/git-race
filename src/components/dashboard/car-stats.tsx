import type { CarStats } from "@/lib/race/car-components";
import { calculateOverallRating } from "@/lib/race/car-components";

interface CarStatsDisplayProps {
  stats: CarStats;
  previousStats?: CarStats | null;
}

const COMPONENTS = [
  { key: "power_unit" as const, name: "Power Unit", hint: "Push more commits" },
  { key: "aero" as const, name: "Aerodynamics", hint: "Open and merge PRs" },
  { key: "reliability" as const, name: "Reliability", hint: "Contribute daily" },
  { key: "tire_mgmt" as const, name: "Tire Management", hint: "Review pull requests" },
  { key: "strategy" as const, name: "Strategy", hint: "Work on issues" },
];

export function CarStatsDisplay({ stats, previousStats }: CarStatsDisplayProps) {
  const overall = calculateOverallRating(stats);
  const prevOverall = previousStats ? calculateOverallRating(previousStats) : null;
  const overallDelta = prevOverall !== null ? Math.round((overall - prevOverall) * 10) / 10 : null;

  return (
    <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-[#0a0a0a]">Car Development</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-[#0a0a0a]">{Math.round(overall)}</span>
          <span className="text-[#a3a3a3] text-xs">OVR</span>
          {overallDelta !== null && overallDelta !== 0 && (
            <span className={`text-xs font-bold ${overallDelta > 0 ? "position-up" : "position-down"}`}>
              {overallDelta > 0 ? "+" : ""}{overallDelta}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {COMPONENTS.map(({ key, name, hint }) => {
          const value = stats[key];
          const prev = previousStats?.[key];
          const delta = prev !== undefined ? Math.round((value - prev) * 10) / 10 : null;

          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#525252] text-sm">{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#0a0a0a] text-sm font-bold">{Math.round(value)}</span>
                  {delta !== null && delta !== 0 && (
                    <span className={`text-xs font-bold ${delta > 0 ? "position-up" : "position-down"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                </div>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill bg-[#0a0a0a]" style={{ width: `${value}%` }} />
              </div>
              <p className="text-[#a3a3a3] text-xs mt-1">{hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
