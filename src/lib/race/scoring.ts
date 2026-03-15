// F1 2025 points system: top 10 finishers
const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const FASTEST_LAP_BONUS = 1;

export function getPointsForPosition(position: number): number {
  if (position < 1 || position > F1_POINTS.length) return 0;
  return F1_POINTS[position - 1];
}

export function getSprintPointsForPosition(position: number): number {
  if (position < 1 || position > SPRINT_POINTS.length) return 0;
  return SPRINT_POINTS[position - 1];
}

export function calculateRacePoints(
  finalPosition: number,
  hasFastestLap: boolean,
  isDNF: boolean,
  isSprint: boolean = false
): number {
  if (isDNF) return 0;

  if (isSprint) {
    // No fastest lap bonus in sprints
    return getSprintPointsForPosition(finalPosition);
  }

  let points = getPointsForPosition(finalPosition);

  // Fastest lap bonus only if finishing in top 10
  if (hasFastestLap && finalPosition <= 10) {
    points += FASTEST_LAP_BONUS;
  }

  return points;
}

export interface StandingsEntry {
  profileId: string;
  username: string;
  totalPoints: number;
  raceResults: Array<{
    raceId: string;
    position: number;
    points: number;
  }>;
}

export function buildSeasonStandings(
  entries: Array<{
    profile_id: string;
    race_id: string;
    final_position: number | null;
    points_earned: number;
    profiles: { github_username: string; total_points: number };
  }>
): StandingsEntry[] {
  const standings = new Map<string, StandingsEntry>();

  for (const entry of entries) {
    if (!standings.has(entry.profile_id)) {
      standings.set(entry.profile_id, {
        profileId: entry.profile_id,
        username: entry.profiles.github_username,
        totalPoints: entry.profiles.total_points,
        raceResults: [],
      });
    }

    standings.get(entry.profile_id)!.raceResults.push({
      raceId: entry.race_id,
      position: entry.final_position ?? 0,
      points: entry.points_earned,
    });
  }

  return Array.from(standings.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
}
