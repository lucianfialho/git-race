import type { CarStats } from "./car-components";

export const BOT_NAMES = [
  "Senna", "Prost", "Schumacher", "Fangio", "Clark",
  "Lauda", "Piquet", "Hakkinen", "Stewart", "Mansell",
  "Hill", "Fittipaldi", "Brabham", "Ascari", "Moss",
  "Hunt", "Villeneuve", "Andretti", "Raikkonen", "Montoya",
  "Coulthard", "Barrichello", "Webber", "Button", "Massa",
  "Rosberg", "Bottas", "Ricciardo", "Kubica", "Kovalainen",
  "Trulli", "Fisichella",
];

// Generate bot stats clustered by division level
export function generateBotStats(
  divisionLevel: number,
  seed: string
): CarStats {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  }
  if (s === 0) s = 1;

  const rng = () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };

  // F3 (level 1): 15-45, F2 (level 2): 35-65, F1 (level 3): 55-90
  const baseMin = 10 + divisionLevel * 20;
  const baseMax = baseMin + 30;
  const range = baseMax - baseMin;

  return {
    power_unit: Math.round((baseMin + rng() * range) * 10) / 10,
    aero: Math.round((baseMin + rng() * range) * 10) / 10,
    reliability: Math.round((baseMin + rng() * range) * 10) / 10,
    tire_mgmt: Math.round((baseMin + rng() * range) * 10) / 10,
    strategy: Math.round((baseMin + rng() * range) * 10) / 10,
  };
}

export function pickBotName(index: number): string {
  return BOT_NAMES[index % BOT_NAMES.length];
}

export interface GridSlot {
  profileId: string | null;
  isBot: boolean;
  botName: string | null;
  botStats: CarStats | null;
}

export function fillGridWithBots(
  realDrivers: Array<{ profileId: string }>,
  divisionLevel: number,
  gpSlug: string,
  gridSize: number = 20
): GridSlot[] {
  const slots: GridSlot[] = realDrivers.map((d) => ({
    profileId: d.profileId,
    isBot: false,
    botName: null,
    botStats: null,
  }));

  const botsNeeded = gridSize - slots.length;
  for (let i = 0; i < botsNeeded; i++) {
    const name = pickBotName(i);
    const seed = `${gpSlug}-bot-${name}-${i}`;
    slots.push({
      profileId: null,
      isBot: true,
      botName: name,
      botStats: generateBotStats(divisionLevel, seed),
    });
  }

  return slots;
}

// Determine promotion/relegation after a race
export interface DivisionMove {
  profileId: string;
  from: number; // division level
  to: number;   // division level
  reason: "promotion" | "relegation";
}

export function calculateDivisionMoves(
  results: Array<{ profileId: string; finalPosition: number; isBot: boolean }>,
  currentDivisionLevel: number,
  maxDivisionLevel: number = 3 // F1
): DivisionMove[] {
  const moves: DivisionMove[] = [];
  const realResults = results.filter((r) => !r.isBot);

  for (const result of realResults) {
    // Top 3 get promoted (unless already at F1)
    if (result.finalPosition <= 3 && currentDivisionLevel < maxDivisionLevel) {
      moves.push({
        profileId: result.profileId,
        from: currentDivisionLevel,
        to: currentDivisionLevel + 1,
        reason: "promotion",
      });
    }
    // Bottom 3 get relegated (unless already at F3)
    const totalDrivers = results.length;
    if (result.finalPosition > totalDrivers - 3 && currentDivisionLevel > 1) {
      moves.push({
        profileId: result.profileId,
        from: currentDivisionLevel,
        to: currentDivisionLevel - 1,
        reason: "relegation",
      });
    }
  }

  return moves;
}
