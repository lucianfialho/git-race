/**
 * Division system — points-based with promotion/relegation zones.
 *
 *   F3 (level 1) — entry division
 *   F2 (level 2) — mid-tier, requires 80 pts
 *   F1 (level 3) — top tier, requires 150 pts
 */

export interface DivisionInfo {
  name: string;   // "F1" | "F2" | "F3"
  level: number;  // 3, 2, 1
}

export interface DivisionConfig {
  name: string;
  level: number;
  pointsThreshold: number;
  gridColor: string;
}

export const DIVISION_CONFIG: DivisionConfig[] = [
  { name: "F3", level: 1, pointsThreshold: 0,   gridColor: "#a3a3a3" },
  { name: "F2", level: 2, pointsThreshold: 80,  gridColor: "#0a0a0a" },
  { name: "F1", level: 3, pointsThreshold: 150, gridColor: "#e10600" },
];

/**
 * Derive a driver's division from their total points.
 *   >= 150 pts  →  F1 (level 3)
 *   >=  80 pts  →  F2 (level 2)
 *   otherwise   →  F3 (level 1)
 */
export function getDivisionFromPoints(totalPoints: number): DivisionInfo {
  if (totalPoints >= 150) return { name: "F1", level: 3 };
  if (totalPoints >= 80)  return { name: "F2", level: 2 };
  return { name: "F3", level: 1 };
}

/**
 * Get display info for a division level.
 */
export function getDivisionLabel(level: number): { name: string; level: number; color: string } {
  const config = DIVISION_CONFIG.find((d) => d.level === level) ?? DIVISION_CONFIG[0];
  return { name: config.name, level: config.level, color: config.gridColor };
}

/**
 * Points needed to reach the next division.
 * Returns null if already at F1.
 */
export function getNextDivisionThreshold(currentLevel: number): number | null {
  const next = DIVISION_CONFIG.find((d) => d.level === currentLevel + 1);
  return next ? next.pointsThreshold : null;
}

/**
 * Points needed for current division (lower bound).
 */
export function getCurrentDivisionThreshold(currentLevel: number): number {
  const config = DIVISION_CONFIG.find((d) => d.level === currentLevel);
  return config?.pointsThreshold ?? 0;
}

/**
 * Top 3 positions in a division grid are the promotion zone.
 */
export function getPromotionZone(_totalDrivers: number): number[] {
  return [1, 2, 3];
}

/**
 * Bottom 3 positions in a division grid are the relegation zone.
 */
export function getRelegationZone(totalDrivers: number): number[] {
  if (totalDrivers <= 3) return [];
  return [totalDrivers - 2, totalDrivers - 1, totalDrivers];
}

/**
 * Given a list of drivers in a single division (sorted by points desc),
 * determine which positions are in promotion/relegation zones.
 */
export function getDriverZone(
  positionInDivision: number,
  totalInDivision: number,
  divisionLevel: number
): "promotion" | "relegation" | null {
  const promoZone = getPromotionZone(totalInDivision);
  const relegZone = getRelegationZone(totalInDivision);

  if (divisionLevel < 3 && promoZone.includes(positionInDivision)) {
    return "promotion";
  }
  if (divisionLevel > 1 && relegZone.includes(positionInDivision)) {
    return "relegation";
  }
  return null;
}
