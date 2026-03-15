import type { CarStats } from "./car-components";
import { calculateRacePoints } from "./scoring";

export interface RaceDriver {
  profileId: string;
  name: string;
  carStats: CarStats;
  gridPosition: number;
  isBot: boolean;
}

export interface RaceEvent {
  lap: number;
  type: "overtake" | "defense" | "pit_stop" | "dnf" | "safety_car" | "rain" | "fastest_lap" | "drs";
  description: string;
  involvedDrivers: string[];
}

export interface RaceConfig {
  totalLaps: number;
  isSprint: boolean;
  seed: string;
  weatherChance: number; // 0-1, probability of rain
}

export interface DriverResult {
  profileId: string;
  name: string;
  isBot: boolean;
  gridPosition: number;
  finalPosition: number;
  points: number;
  fastestLap: boolean;
  dnf: boolean;
  dnfLap: number | null;
  dnfReason: string | null;
  gapToLeader: number;
}

export interface RaceSimulationResult {
  results: DriverResult[];
  events: RaceEvent[];
  hadRain: boolean;
  safetyCars: number;
}

// Seeded PRNG (same as qualifying)
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

const OVERTAKE_TEMPLATES = [
  "{driver} overtakes {other} with DRS on the main straight!",
  "{driver} makes a bold move on {other} into Turn 1!",
  "{driver} dives past {other} on the inside of the hairpin!",
  "{driver} uses superior traction to pass {other} out of the chicane!",
  "{driver} gets alongside {other} and completes the overtake!",
];

const DEFENSE_TEMPLATES = [
  "{driver} holds off a charging {other} with great defensive driving!",
  "{other} tries to pass {driver} but can't find a way through!",
  "{driver} defends the position brilliantly against {other}!",
];

const DNF_REASONS = [
  "Engine failure",
  "Gearbox failure",
  "Hydraulic leak",
  "Electrical issue",
  "Brake failure",
  "Suspension damage",
  "Collision damage",
];

export function simulateRace(
  drivers: RaceDriver[],
  config: RaceConfig
): RaceSimulationResult {
  const rng = createRNG(config.seed);
  const events: RaceEvent[] = [];

  // Initialize positions from grid
  const positions = drivers
    .slice()
    .sort((a, b) => a.gridPosition - b.gridPosition)
    .map((d) => ({
      ...d,
      currentPosition: d.gridPosition,
      dnf: false,
      dnfLap: null as number | null,
      dnfReason: null as string | null,
      gap: 0,
      bestLapTime: Infinity,
    }));

  let hadRain = false;
  let safetyCars = 0;
  let rainActive = false;

  // Simulate lap by lap
  for (let lap = 1; lap <= config.totalLaps; lap++) {
    const activeDrivers = positions.filter((d) => !d.dnf);

    // Safety car check (~5% per lap)
    if (rng() < 0.05 && lap > 1 && lap < config.totalLaps - 2) {
      safetyCars++;
      events.push({
        lap,
        type: "safety_car",
        description: `Safety Car deployed! The field bunches up.`,
        involvedDrivers: [],
      });
      // Reduce gaps
      activeDrivers.forEach((d) => {
        d.gap = Math.max(0, d.gap * 0.2);
      });
    }

    // Rain check
    if (!rainActive && rng() < config.weatherChance * 0.15 && lap > 5) {
      rainActive = true;
      hadRain = true;
      events.push({
        lap,
        type: "rain",
        description: `Rain starts falling! Drivers with good tire management have the advantage.`,
        involvedDrivers: [],
      });
    }

    // Process each pair of adjacent drivers for overtakes
    for (let i = 0; i < activeDrivers.length - 1; i++) {
      const ahead = activeDrivers[i];
      const behind = activeDrivers[i + 1];

      // Calculate overtake probability
      const motorAdvantage = (behind.carStats.power_unit - ahead.carStats.power_unit) / 100;
      const aeroDefense = (ahead.carStats.aero - behind.carStats.aero) / 200;
      const rainBonus = rainActive
        ? (behind.carStats.tire_mgmt - ahead.carStats.tire_mgmt) / 200
        : 0;

      let overtakeProb = 0.03 + motorAdvantage * 0.25 - aeroDefense * 0.08 + rainBonus * 0.1;
      overtakeProb = Math.max(0.01, Math.min(0.35, overtakeProb));

      if (rng() < overtakeProb) {
        // Overtake happens
        const tempPos = ahead.currentPosition;
        ahead.currentPosition = behind.currentPosition;
        behind.currentPosition = tempPos;

        // Swap in array
        activeDrivers[i] = behind;
        activeDrivers[i + 1] = ahead;

        // Only log ~30% of overtakes to keep events manageable
        if (rng() < 0.3 || lap === 1 || lap === config.totalLaps) {
          const template = OVERTAKE_TEMPLATES[Math.floor(rng() * OVERTAKE_TEMPLATES.length)];
          events.push({
            lap,
            type: "overtake",
            description: template
              .replace("{driver}", behind.name)
              .replace("{other}", ahead.name),
            involvedDrivers: [behind.profileId, ahead.profileId],
          });
        }
      } else if (motorAdvantage > 0.1 && rng() < 0.1) {
        // Defense event
        const template = DEFENSE_TEMPLATES[Math.floor(rng() * DEFENSE_TEMPLATES.length)];
        events.push({
          lap,
          type: "defense",
          description: template
            .replace("{driver}", ahead.name)
            .replace("{other}", behind.name),
          involvedDrivers: [ahead.profileId, behind.profileId],
        });
      }
    }

    // Pit stops (around lap 20-30 for race, not for sprint)
    if (!config.isSprint) {
      const pitWindow = config.totalLaps * 0.4;
      const pitWindowEnd = config.totalLaps * 0.6;

      if (lap >= pitWindow && lap <= pitWindowEnd) {
        for (const driver of activeDrivers) {
          const pitProb = (100 - driver.carStats.strategy) / 1000;
          const optimalLap = Math.floor(pitWindow + (driver.carStats.strategy / 100) * (pitWindowEnd - pitWindow));

          if (lap === optimalLap || rng() < pitProb) {
            // Only log each driver's pit once
            if (!events.some((e) => e.type === "pit_stop" && e.involvedDrivers.includes(driver.profileId))) {
              const timeQuality = driver.carStats.strategy > 70 ? "quick" : driver.carStats.strategy > 40 ? "clean" : "slow";
              events.push({
                lap,
                type: "pit_stop",
                description: `${driver.name} pits for fresh tires — a ${timeQuality} stop by the crew!`,
                involvedDrivers: [driver.profileId],
              });
            }
          }
        }
      }
    }

    // DNF check (very low probability, influenced by reliability)
    for (const driver of activeDrivers) {
      const dnfProb = ((100 - driver.carStats.reliability) / 100) * 0.003;
      if (rng() < dnfProb && lap > 3) {
        driver.dnf = true;
        driver.dnfLap = lap;
        driver.dnfReason = DNF_REASONS[Math.floor(rng() * DNF_REASONS.length)];
        events.push({
          lap,
          type: "dnf",
          description: `${driver.name} retires from the race! ${driver.dnfReason}.`,
          involvedDrivers: [driver.profileId],
        });
      }
    }

    // Calculate lap times for fastest lap tracking
    for (const driver of activeDrivers) {
      if (driver.dnf) continue;
      const baseLap = 85 - (driver.carStats.power_unit * 0.03) - (driver.carStats.aero * 0.02);
      const lapTime = baseLap + (rng() - 0.5) * 2;
      if (lapTime < driver.bestLapTime) {
        driver.bestLapTime = lapTime;
      }
    }
  }

  // Calculate final positions
  const activeAtEnd = positions.filter((d) => !d.dnf);
  activeAtEnd.sort((a, b) => a.currentPosition - b.currentPosition);

  const dnfDrivers = positions.filter((d) => d.dnf);
  dnfDrivers.sort((a, b) => (b.dnfLap ?? 0) - (a.dnfLap ?? 0)); // Later DNF = better position

  const finalOrder = [...activeAtEnd, ...dnfDrivers];

  // Find fastest lap
  let fastestLapDriver: string | null = null;
  let fastestTime = Infinity;
  for (const driver of activeAtEnd) {
    if (driver.bestLapTime < fastestTime) {
      fastestTime = driver.bestLapTime;
      fastestLapDriver = driver.profileId;
    }
  }

  if (fastestLapDriver) {
    events.push({
      lap: config.totalLaps,
      type: "fastest_lap",
      description: `${finalOrder.find((d) => d.profileId === fastestLapDriver)?.name} sets the fastest lap of the race!`,
      involvedDrivers: [fastestLapDriver],
    });
  }

  // Build results
  const results: DriverResult[] = finalOrder.map((driver, index) => {
    const position = index + 1;
    const hasFastestLap = driver.profileId === fastestLapDriver;
    const points = calculateRacePoints(position, hasFastestLap, driver.dnf, config.isSprint);

    return {
      profileId: driver.profileId,
      name: driver.name,
      isBot: driver.isBot,
      gridPosition: driver.gridPosition,
      finalPosition: position,
      points,
      fastestLap: hasFastestLap,
      dnf: driver.dnf,
      dnfLap: driver.dnfLap,
      dnfReason: driver.dnfReason,
      gapToLeader: index === 0 ? 0 : index * (rng() * 3 + 0.5),
    };
  });

  return { results, events, hadRain, safetyCars };
}
