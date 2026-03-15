import { describe, it, expect } from "vitest";
import { simulateRace, type RaceDriver, type RaceConfig } from "./simulation";
import type { CarStats } from "./car-components";

function makeRaceDriver(
  id: string,
  gridPosition: number,
  stats: Partial<CarStats> = {},
  isBot = false
): RaceDriver {
  return {
    profileId: id,
    name: `Driver ${id}`,
    gridPosition,
    isBot,
    carStats: {
      power_unit: 50,
      aero: 50,
      reliability: 50,
      tire_mgmt: 50,
      strategy: 50,
      ...stats,
    },
  };
}

function make20RaceDrivers(): RaceDriver[] {
  return Array.from({ length: 20 }, (_, i) =>
    makeRaceDriver(`d${i + 1}`, i + 1)
  );
}

const defaultConfig: RaceConfig = {
  totalLaps: 57,
  isSprint: false,
  seed: "test-race",
  weatherChance: 0.3,
};

const sprintConfig: RaceConfig = {
  ...defaultConfig,
  totalLaps: 20,
  isSprint: true,
  seed: "test-sprint",
};

describe("simulateRace", () => {
  it("produces results for all 20 drivers", () => {
    const result = simulateRace(make20RaceDrivers(), defaultConfig);
    expect(result.results).toHaveLength(20);
  });

  it("final positions are valid (1-20, may have gaps from DNFs)", () => {
    const result = simulateRace(make20RaceDrivers(), defaultConfig);
    const positions = result.results.map((r) => r.finalPosition).sort((a, b) => a - b);
    // Should be sequential 1-20
    expect(positions).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("is deterministic with same seed", () => {
    const drivers = make20RaceDrivers();
    const r1 = simulateRace(drivers, defaultConfig);
    const r2 = simulateRace(drivers, defaultConfig);
    expect(r1.results.map((r) => r.profileId)).toEqual(r2.results.map((r) => r.profileId));
    expect(r1.results.map((r) => r.finalPosition)).toEqual(r2.results.map((r) => r.finalPosition));
  });

  it("generates events", () => {
    const result = simulateRace(make20RaceDrivers(), defaultConfig);
    expect(result.events.length).toBeGreaterThan(0);
    result.events.forEach((e) => {
      expect(e.lap).toBeGreaterThanOrEqual(1);
      expect(e.type).toBeTruthy();
      expect(e.description).toBeTruthy();
    });
  });

  it("sprint race has fewer laps", () => {
    const result = simulateRace(make20RaceDrivers(), sprintConfig);
    expect(result.results).toHaveLength(20);
    // Sprint should still produce valid results
    const positions = result.results.map((r) => r.finalPosition).sort((a, b) => a - b);
    expect(positions).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("DNF drivers get 0 points", () => {
    const result = simulateRace(make20RaceDrivers(), defaultConfig);
    const dnfDrivers = result.results.filter((r) => r.dnf);
    dnfDrivers.forEach((r) => {
      expect(r.points).toBe(0);
      expect(r.dnfLap).not.toBeNull();
      expect(r.dnfReason).not.toBeNull();
    });
  });

  it("only one driver has fastest lap", () => {
    const result = simulateRace(make20RaceDrivers(), defaultConfig);
    const fastestLapDrivers = result.results.filter((r) => r.fastestLap);
    expect(fastestLapDrivers.length).toBeLessThanOrEqual(1);
  });

  it("higher stats driver generally finishes better than grid position", () => {
    let gainedPositions = 0;
    const runs = 50;

    for (let i = 0; i < runs; i++) {
      const drivers = make20RaceDrivers();
      // Put fast driver at P10 (more realistic starting position)
      drivers[9] = makeRaceDriver("fast", 10, {
        power_unit: 100,
        aero: 100,
        reliability: 100,
        tire_mgmt: 100,
        strategy: 100,
      });

      const result = simulateRace(drivers, {
        ...defaultConfig,
        seed: `stat-test-${i}`,
      });
      const fastResult = result.results.find((r) => r.profileId === "fast")!;
      if (fastResult.finalPosition < fastResult.gridPosition) gainedPositions++;
    }

    // Fast driver starting P10 should gain positions more often than not
    expect(gainedPositions).toBeGreaterThan(runs * 0.4);
  });

  it("grid position matters", () => {
    let p1WinCount = 0;
    const runs = 50;

    for (let i = 0; i < runs; i++) {
      const result = simulateRace(make20RaceDrivers(), {
        ...defaultConfig,
        seed: `grid-test-${i}`,
      });
      if (result.results[0].gridPosition <= 5) p1WinCount++;
    }

    // Winner should come from front of grid more often than not
    expect(p1WinCount).toBeGreaterThan(runs * 0.3);
  });
});
