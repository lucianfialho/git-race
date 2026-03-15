import type { CarStats } from "@/lib/race/car-components";
import { calculateOverallRating } from "@/lib/race/car-components";

interface CarStatsDisplayProps {
  stats: CarStats;
  previousStats?: CarStats | null;
}

const COMPONENTS = [
  { key: "power_unit" as const, name: "Power Unit", icon: "\u{26A1}", color: "#ef4444", hint: "Push more commits to improve" },
  { key: "aero" as const, name: "Aerodynamics", icon: "\u{1F4A8}", color: "#3b82f6", hint: "Open and merge more PRs" },
  { key: "reliability" as const, name: "Reliability", icon: "\u{1F6E1}\u{FE0F}", color: "#22c55e", hint: "Contribute consistently every day" },
  { key: "tire_mgmt" as const, name: "Tire Management", icon: "\u{1F6DE}", color: "#a855f7", hint: "Review more pull requests" },
  { key: "strategy" as const, name: "Strategy", icon: "\u{1F9E0}", color: "#f59e0b", hint: "Open and close more issues" },
];

export function CarStatsDisplay({ stats, previousStats }: CarStatsDisplayProps) {
  const overall = calculateOverallRating(stats);
  const prevOverall = previousStats ? calculateOverallRating(previousStats) : null;
  const overallDelta = prevOverall !== null ? Math.round((overall - prevOverall) * 10) / 10 : null;

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white">Car Development</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{Math.round(overall)}</span>
          <span className="text-neutral-500 text-xs">OVR</span>
          {overallDelta !== null && overallDelta !== 0 && (
            <span className={`text-xs font-mono ${overallDelta > 0 ? "position-up" : "position-down"}`}>
              {overallDelta > 0 ? "+" : ""}{overallDelta}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {COMPONENTS.map(({ key, name, icon, color, hint }) => {
          const value = stats[key];
          const prev = previousStats?.[key];
          const delta = prev !== undefined ? Math.round((value - prev) * 10) / 10 : null;

          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-neutral-300 text-sm">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm font-bold">{Math.round(value)}</span>
                  {delta !== null && delta !== 0 && (
                    <span className={`text-xs font-mono ${delta > 0 ? "position-up" : "position-down"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                </div>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${value}%`, background: color }} />
              </div>
              <p className="text-neutral-600 text-xs mt-1 hidden group-hover:block">{hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
