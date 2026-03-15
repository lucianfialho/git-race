import type { CarStats } from "./car-components";

export interface QualifyingDriver {
  profileId: string;
  name: string;
  carStats: CarStats;
  isBot: boolean;
}

export interface QualifyingResult {
  profileId: string;
  name: string;
  isBot: boolean;
  q1Time: number;
  q2Time: number | null;
  q3Time: number | null;
  finalPosition: number;
  eliminatedIn: "Q1" | "Q2" | null;
}

// Simple seeded PRNG (xorshift32)
function createRNG(seed: string): () => number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  if (s === 0) s = 1;

  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export function calculateLapTime(
  carStats: CarStats,
  rng: () => number
): number {
  // Base lap time ~90s. Each component reduces time.
  const baseLap = 90;
  const reduction =
    (carStats.power_unit * 0.04) +
    (carStats.aero * 0.03) +
    (carStats.reliability * 0.01) +
    (carStats.tire_mgmt * 0.01) +
    (carStats.strategy * 0.01);

  // Random variance: ±0.5s
  const variance = (rng() - 0.5) * 1.0;

  return baseLap - reduction + variance;
}

export function runQualifying(
  drivers: QualifyingDriver[],
  seed: string = "default"
): QualifyingResult[] {
  const rng = createRNG(seed);

  // Q1: All 20 drivers, eliminate bottom 5
  const q1Times = drivers.map((d) => ({
    ...d,
    q1Time: calculateLapTime(d.carStats, rng),
  }));
  q1Times.sort((a, b) => a.q1Time - b.q1Time);

  const q1Cutoff = 15;
  const q1Eliminated = q1Times.slice(q1Cutoff);
  const q1Survivors = q1Times.slice(0, q1Cutoff);

  // Q2: Top 15, eliminate bottom 5
  const q2Times = q1Survivors.map((d) => ({
    ...d,
    q2Time: calculateLapTime(d.carStats, rng),
  }));
  q2Times.sort((a, b) => a.q2Time - b.q2Time);

  const q2Cutoff = 10;
  const q2Eliminated = q2Times.slice(q2Cutoff);
  const q2Survivors = q2Times.slice(0, q2Cutoff);

  // Q3: Top 10, fight for pole
  const q3Times = q2Survivors.map((d) => ({
    ...d,
    q3Time: calculateLapTime(d.carStats, rng),
  }));
  q3Times.sort((a, b) => a.q3Time - b.q3Time);

  // Build results
  const results: QualifyingResult[] = [];

  // Q3 drivers (P1-P10)
  q3Times.forEach((d, i) => {
    results.push({
      profileId: d.profileId,
      name: d.name,
      isBot: d.isBot,
      q1Time: d.q1Time,
      q2Time: d.q2Time,
      q3Time: d.q3Time,
      finalPosition: i + 1,
      eliminatedIn: null,
    });
  });

  // Q2 eliminated (P11-P15)
  q2Eliminated.forEach((d, i) => {
    results.push({
      profileId: d.profileId,
      name: d.name,
      isBot: d.isBot,
      q1Time: d.q1Time,
      q2Time: d.q2Time,
      q3Time: null,
      finalPosition: q2Cutoff + i + 1,
      eliminatedIn: "Q2",
    });
  });

  // Q1 eliminated (P16-P20)
  q1Eliminated.forEach((d, i) => {
    results.push({
      profileId: d.profileId,
      name: d.name,
      isBot: d.isBot,
      q1Time: d.q1Time,
      q2Time: null,
      q3Time: null,
      finalPosition: q1Cutoff + i + 1,
      eliminatedIn: "Q1",
    });
  });

  return results;
}
