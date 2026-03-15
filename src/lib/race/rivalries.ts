export interface RivalComparison {
  rivalId: string;
  rivalName: string;
  rivalAvatar: string;
  yourPoints: number;
  rivalPoints: number;
  pointsDiff: number;
  yourPosition: number;
  rivalPosition: number;
  headToHead: {
    wins: number;
    losses: number;
  };
}

export interface StandingEntry {
  profileId: string;
  name: string;
  points: number;
  position: number;
  isBot: boolean;
}

// Find closest 1-2 rivals in championship standings
export function detectRivals(
  profileId: string,
  standings: StandingEntry[]
): string[] {
  const myIndex = standings.findIndex((s) => s.profileId === profileId);
  if (myIndex === -1) return [];

  const rivals: string[] = [];
  const myPoints = standings[myIndex].points;

  // Check driver above
  if (myIndex > 0) {
    const above = standings[myIndex - 1];
    if (Math.abs(above.points - myPoints) <= 30) {
      rivals.push(above.profileId);
    }
  }

  // Check driver below
  if (myIndex < standings.length - 1) {
    const below = standings[myIndex + 1];
    if (Math.abs(below.points - myPoints) <= 30) {
      rivals.push(below.profileId);
    }
  }

  // If no close rivals, just pick adjacent
  if (rivals.length === 0) {
    if (myIndex > 0) rivals.push(standings[myIndex - 1].profileId);
    else if (myIndex < standings.length - 1) rivals.push(standings[myIndex + 1].profileId);
  }

  return rivals.slice(0, 2);
}

// Calculate head-to-head record from race results
export function calculateHeadToHead(
  profileId: string,
  rivalId: string,
  raceResults: Array<{
    gpId: string;
    results: Array<{ profileId: string; finalPosition: number }>;
  }>
): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;

  for (const race of raceResults) {
    const myResult = race.results.find((r) => r.profileId === profileId);
    const rivalResult = race.results.find((r) => r.profileId === rivalId);

    if (myResult && rivalResult) {
      if (myResult.finalPosition < rivalResult.finalPosition) wins++;
      else if (myResult.finalPosition > rivalResult.finalPosition) losses++;
    }
  }

  return { wins, losses };
}
