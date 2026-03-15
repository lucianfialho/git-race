import { describe, it, expect } from "vitest";
import { runQualifying, calculateLapTime, type QualifyingDriver } from "./qualifying";
import type { CarStats } from "./car-components";

function makeDriver(id: string, stats: Partial<CarStats> = {}, isBot = false): QualifyingDriver {
  return {
    profileId: id,
    name: `Driver ${id}`,
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

function make20Drivers(): QualifyingDriver[] {
  return Array.from({ length: 20 }, (_, i) => makeDriver(`d${i + 1}`));
}

describe("calculateLapTime", () => {
  it("returns a valid lap time", () => {
    let seed = 42;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const stats: CarStats = { power_unit: 50, aero: 50, reliability: 50, tire_mgmt: 50, strategy: 50 };
    const time = calculateLapTime(stats, rng);
    expect(time).toBeGreaterThan(80);
    expect(time).toBeLessThan(100);
    expect(Number.isFinite(time)).toBe(true);
  });
});

describe("runQualifying", () => {
  it("produces 20 results from 20 drivers", () => {
    const results = runQualifying(make20Drivers(), "test-seed");
    expect(results).toHaveLength(20);
  });

  it("positions are 1-20", () => {
    const results = runQualifying(make20Drivers(), "test-seed");
    const positions = results.map((r) => r.finalPosition).sort((a, b) => a - b);
    expect(positions).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("Q1 eliminates 5 drivers (P16-P20)", () => {
    const results = runQualifying(make20Drivers(), "test-seed");
    const q1Eliminated = results.filter((r) => r.eliminatedIn === "Q1");
    expect(q1Eliminated).toHaveLength(5);
    q1Eliminated.forEach((r) => {
      expect(r.finalPosition).toBeGreaterThanOrEqual(16);
      expect(r.q2Time).toBeNull();
      expect(r.q3Time).toBeNull();
    });
  });

  it("Q2 eliminates 5 drivers (P11-P15)", () => {
    const results = runQualifying(make20Drivers(), "test-seed");
    const q2Eliminated = results.filter((r) => r.eliminatedIn === "Q2");
    expect(q2Eliminated).toHaveLength(5);
    q2Eliminated.forEach((r) => {
      expect(r.finalPosition).toBeGreaterThanOrEqual(11);
      expect(r.finalPosition).toBeLessThanOrEqual(15);
      expect(r.q2Time).not.toBeNull();
      expect(r.q3Time).toBeNull();
    });
  });

  it("top 10 have Q3 times", () => {
    const results = runQualifying(make20Drivers(), "test-seed");
    const top10 = results.filter((r) => r.finalPosition <= 10);
    expect(top10).toHaveLength(10);
    top10.forEach((r) => {
      expect(r.q3Time).not.toBeNull();
      expect(r.eliminatedIn).toBeNull();
    });
  });

  it("is deterministic with same seed", () => {
    const drivers = make20Drivers();
    const r1 = runQualifying(drivers, "same-seed");
    const r2 = runQualifying(drivers, "same-seed");
    expect(r1.map((r) => r.profileId)).toEqual(r2.map((r) => r.profileId));
    expect(r1.map((r) => r.q1Time)).toEqual(r2.map((r) => r.q1Time));
  });

  it("driver with best stats tends to qualify higher", () => {
    let poleCount = 0;
    const topHalf = 0;

    for (let i = 0; i < 50; i++) {
      const drivers = make20Drivers();
      drivers[0] = makeDriver("fast", { power_unit: 100, aero: 100, reliability: 100, tire_mgmt: 100, strategy: 100 });
      const results = runQualifying(drivers, `seed-${i}`);
      const fastResult = results.find((r) => r.profileId === "fast")!;
      if (fastResult.finalPosition === 1) poleCount++;
    }
    // Fast driver should get pole most of the time
    expect(poleCount).toBeGreaterThan(25);
  });

  it("bots participate like real drivers", () => {
    const drivers = make20Drivers();
    drivers[19] = makeDriver("bot1", {}, true);
    const results = runQualifying(drivers, "bot-seed");
    const botResult = results.find((r) => r.profileId === "bot1")!;
    expect(botResult).toBeDefined();
    expect(botResult.isBot).toBe(true);
    expect(botResult.finalPosition).toBeGreaterThanOrEqual(1);
    expect(botResult.finalPosition).toBeLessThanOrEqual(20);
  });

  it("all lap times are valid numbers", () => {
    const results = runQualifying(make20Drivers(), "valid-seed");
    results.forEach((r) => {
      expect(Number.isFinite(r.q1Time)).toBe(true);
      if (r.q2Time !== null) expect(Number.isFinite(r.q2Time)).toBe(true);
      if (r.q3Time !== null) expect(Number.isFinite(r.q3Time)).toBe(true);
    });
  });
});
