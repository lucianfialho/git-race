interface ActivityMetrics {
  commits_count: number;
  prs_opened: number;
  prs_merged: number;
  prs_reviewed: number;
  issues_opened: number;
  issues_closed: number;
  lines_added: number;
  lines_deleted: number;
  repos_contributed_to: number;
}

interface DayContribution {
  contributionCount: number;
  date: string;
}

export interface CarStats {
  power_unit: number;
  aero: number;
  reliability: number;
  tire_mgmt: number;
  strategy: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateCarComponents(
  metrics: ActivityMetrics,
  days: DayContribution[]
): CarStats {
  const power_unit = clamp(Math.log2(metrics.commits_count * 3 + 1) * 10, 0, 100);
  const aero = clamp(Math.log2(metrics.prs_opened * 5 + metrics.prs_merged * 8 + 1) * 10, 0, 100);

  const totalDays = days.length;
  const activeDays = days.filter((d) => d.contributionCount > 0).length;
  const reliability = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;

  const tire_mgmt = clamp(Math.log2(metrics.prs_reviewed * 4 + 1) * 10, 0, 100);
  const strategy = clamp(Math.log2(metrics.issues_opened * 2 + metrics.issues_closed * 3 + 1) * 10, 0, 100);

  return {
    power_unit: Math.round(power_unit * 10) / 10,
    aero: Math.round(aero * 10) / 10,
    reliability: Math.round(reliability * 10) / 10,
    tire_mgmt: Math.round(tire_mgmt * 10) / 10,
    strategy: Math.round(strategy * 10) / 10,
  };
}

const COMPONENT_WEIGHTS = {
  power_unit: 0.25,
  aero: 0.25,
  reliability: 0.2,
  tire_mgmt: 0.15,
  strategy: 0.15,
} as const;

export function calculateOverallRating(stats: CarStats): number {
  let total = 0;
  for (const [key, weight] of Object.entries(COMPONENT_WEIGHTS)) {
    total += stats[key as keyof CarStats] * weight;
  }
  return Math.round(total * 10) / 10;
}
