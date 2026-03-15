import { describe, it, expect } from "vitest";
import {
  generateBotStats,
  fillGridWithBots,
  calculateDivisionMoves,
  pickBotName,
  BOT_NAMES,
} from "./matchmaking";

describe("generateBotStats", () => {
  it("generates stats within F3 range for level 1", () => {
    const stats = generateBotStats(1, "test-bot");
    expect(stats.power_unit).toBeGreaterThanOrEqual(10);
    expect(stats.power_unit).toBeLessThanOrEqual(70);
    expect(stats.aero).toBeGreaterThanOrEqual(10);
    expect(stats.reliability).toBeGreaterThanOrEqual(10);
  });

  it("generates higher stats for F1 (level 3)", () => {
    let f3Total = 0;
    let f1Total = 0;
    for (let i = 0; i < 20; i++) {
      const f3 = generateBotStats(1, `seed-${i}`);
      const f1 = generateBotStats(3, `seed-${i}`);
      f3Total += f3.power_unit + f3.aero + f3.reliability + f3.tire_mgmt + f3.strategy;
      f1Total += f1.power_unit + f1.aero + f1.reliability + f1.tire_mgmt + f1.strategy;
    }
    expect(f1Total).toBeGreaterThan(f3Total);
  });

  it("is deterministic with same seed", () => {
    const a = generateBotStats(2, "same-seed");
    const b = generateBotStats(2, "same-seed");
    expect(a).toEqual(b);
  });
});

describe("pickBotName", () => {
  it("returns a name from the list", () => {
    expect(BOT_NAMES).toContain(pickBotName(0));
    expect(BOT_NAMES).toContain(pickBotName(5));
  });

  it("wraps around when index exceeds list", () => {
    const name = pickBotName(BOT_NAMES.length + 1);
    expect(BOT_NAMES).toContain(name);
  });
});

describe("fillGridWithBots", () => {
  it("fills to exactly 20 drivers", () => {
    const grid = fillGridWithBots(
      [{ profileId: "user1" }, { profileId: "user2" }],
      1,
      "australia-2025"
    );
    expect(grid).toHaveLength(20);
  });

  it("puts real drivers first, bots after", () => {
    const grid = fillGridWithBots(
      [{ profileId: "user1" }],
      1,
      "test-gp"
    );
    expect(grid[0].isBot).toBe(false);
    expect(grid[0].profileId).toBe("user1");
    expect(grid[1].isBot).toBe(true);
    expect(grid[1].botName).toBeTruthy();
    expect(grid[1].botStats).not.toBeNull();
  });

  it("creates no bots when grid is full", () => {
    const drivers = Array.from({ length: 20 }, (_, i) => ({
      profileId: `user${i}`,
    }));
    const grid = fillGridWithBots(drivers, 2, "test-gp");
    expect(grid.every((s) => !s.isBot)).toBe(true);
  });

  it("creates 20 bots for solo mode", () => {
    const grid = fillGridWithBots([], 1, "solo-gp");
    expect(grid).toHaveLength(20);
    expect(grid.every((s) => s.isBot)).toBe(true);
  });
});

describe("calculateDivisionMoves", () => {
  const makeResults = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      profileId: `d${i + 1}`,
      finalPosition: i + 1,
      isBot: false,
    }));

  it("promotes top 3 in F3 (level 1)", () => {
    const results = makeResults(20);
    const moves = calculateDivisionMoves(results, 1);
    const promotions = moves.filter((m) => m.reason === "promotion");
    expect(promotions).toHaveLength(3);
    expect(promotions.map((m) => m.profileId)).toEqual(["d1", "d2", "d3"]);
    expect(promotions[0].to).toBe(2);
  });

  it("relegates bottom 3 in F2 (level 2)", () => {
    const results = makeResults(20);
    const moves = calculateDivisionMoves(results, 2);
    const relegations = moves.filter((m) => m.reason === "relegation");
    expect(relegations).toHaveLength(3);
    expect(relegations.map((m) => m.profileId)).toContain("d18");
    expect(relegations.map((m) => m.profileId)).toContain("d19");
    expect(relegations.map((m) => m.profileId)).toContain("d20");
    expect(relegations[0].to).toBe(1);
  });

  it("does not promote from F1 (max level)", () => {
    const results = makeResults(20);
    const moves = calculateDivisionMoves(results, 3, 3);
    const promotions = moves.filter((m) => m.reason === "promotion");
    expect(promotions).toHaveLength(0);
  });

  it("does not relegate from F3 (min level)", () => {
    const results = makeResults(20);
    const moves = calculateDivisionMoves(results, 1);
    const relegations = moves.filter((m) => m.reason === "relegation");
    expect(relegations).toHaveLength(0);
  });

  it("ignores bots in division moves", () => {
    const results = [
      { profileId: "human", finalPosition: 1, isBot: false },
      ...Array.from({ length: 19 }, (_, i) => ({
        profileId: `bot${i}`,
        finalPosition: i + 2,
        isBot: true,
      })),
    ];
    const moves = calculateDivisionMoves(results, 1);
    expect(moves.every((m) => m.profileId === "human")).toBe(true);
  });
});
