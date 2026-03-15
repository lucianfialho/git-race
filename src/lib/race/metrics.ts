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

const WEIGHTS = {
  prs_merged: 8,
  repos_contributed_to: 6,
  prs_opened: 5,
  prs_reviewed: 4,
  commits_count: 3,
  issues_closed: 3,
  issues_opened: 2,
  lines_added: 0.01,
  lines_deleted: 0.005,
} as const;

export function calculateRawScore(metrics: ActivityMetrics): number {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += (metrics[key as keyof ActivityMetrics] || 0) * weight;
  }
  return score;
}

export function calculateSpeed(metrics: ActivityMetrics): number {
  const raw = calculateRawScore(metrics);
  return Math.log2(raw + 1) * 10;
}

export function calculateConsistency(days: DayContribution[]): number {
  if (days.length === 0) return 0;
  const activeDays = days.filter((d) => d.contributionCount > 0).length;
  return (activeDays / days.length) * 100;
}

export function calculateImpact(metrics: ActivityMetrics): number {
  // Impact = PRs merged weight + reviews weight + repos breadth
  const prImpact = metrics.prs_merged * 3;
  const reviewImpact = metrics.prs_reviewed * 2;
  const breadth = metrics.repos_contributed_to * 1.5;
  return Math.log2(prImpact + reviewImpact + breadth + 1) * 10;
}

export function calculateScores(
  metrics: ActivityMetrics,
  days: DayContribution[]
) {
  return {
    speed_score: calculateSpeed(metrics),
    consistency_score: calculateConsistency(days),
    impact_score: calculateImpact(metrics),
  };
}

export function calculatePitStops(days: DayContribution[]): number {
  let gaps = 0;
  let inGap = false;

  for (const day of days) {
    if (day.contributionCount === 0) {
      if (!inGap) {
        gaps++;
        inGap = true;
      }
    } else {
      inGap = false;
    }
  }

  return gaps;
}

export function findFastestLap(days: DayContribution[]): {
  date: string;
  count: number;
} | null {
  if (days.length === 0) return null;
  const best = days.reduce((b, day) =>
    day.contributionCount > b.contributionCount ? day : b
  );
  return { date: best.date, count: best.contributionCount };
}
