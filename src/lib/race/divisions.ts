/**
 * Division helpers — points-based proxy until full promotion/relegation is wired.
 */

export interface DivisionInfo {
  name: string;   // "F1" | "F2" | "F3"
  level: number;  // 3, 2, 1
}

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
