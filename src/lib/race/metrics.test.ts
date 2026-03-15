import { describe, it, expect } from "vitest";
import {
  calculateRawScore,
  calculateSpeed,
  calculateConsistency,
  calculateImpact,
  calculateScores,
  calculatePitStops,
  findFastestLap,
} from "./metrics";

const baseMetrics = {
  commits_count: 50,
  prs_opened: 5,
  prs_merged: 3,
  prs_reviewed: 4,
  issues_opened: 2,
  issues_closed: 1,
  lines_added: 1000,
  lines_deleted: 500,
  repos_contributed_to: 3,
};

const zeroed = {
  commits_count: 0,
  prs_opened: 0,
  prs_merged: 0,
  prs_reviewed: 0,
  issues_opened: 0,
  issues_closed: 0,
  lines_added: 0,
  lines_deleted: 0,
  repos_contributed_to: 0,
};

describe("calculateRawScore", () => {
  it("applies correct weights to each metric", () => {
    const score = calculateRawScore(baseMetrics);
    // 3*8 + 3*6 + 5*5 + 4*4 + 50*3 + 1*3 + 2*2 + 1000*0.01 + 500*0.005
    const expected =
      3 * 8 +
      3 * 6 +
      5 * 5 +
      4 * 4 +
      50 * 3 +
      1 * 3 +
      2 * 2 +
      1000 * 0.01 +
      500 * 0.005;
    expect(score).toBeCloseTo(expected);
  });

  it("returns 0 for zeroed metrics", () => {
    expect(calculateRawScore(zeroed)).toBe(0);
  });

  it("weights PRs merged highest", () => {
    const onlyPRs = { ...zeroed, prs_merged: 1 };
    const onlyCommits = { ...zeroed, commits_count: 1 };
    expect(calculateRawScore(onlyPRs)).toBeGreaterThan(
      calculateRawScore(onlyCommits)
    );
  });
});

describe("calculateSpeed", () => {
  it("returns 0 for zeroed metrics", () => {
    expect(calculateSpeed(zeroed)).toBe(0);
  });

  it("returns positive value for active user", () => {
    expect(calculateSpeed(baseMetrics)).toBeGreaterThan(0);
  });

  it("uses logarithmic scale — doubling input does not double speed", () => {
    const single = { ...zeroed, commits_count: 50 };
    const doubled = { ...zeroed, commits_count: 100 };
    const speedSingle = calculateSpeed(single);
    const speedDoubled = calculateSpeed(doubled);
    expect(speedDoubled).toBeGreaterThan(speedSingle);
    expect(speedDoubled).toBeLessThan(speedSingle * 2);
  });
});

describe("calculateConsistency", () => {
  it("returns 0 for empty days", () => {
    expect(calculateConsistency([])).toBe(0);
  });

  it("returns 100 when all days have activity", () => {
    const days = [
      { contributionCount: 5, date: "2026-01-01" },
      { contributionCount: 3, date: "2026-01-02" },
      { contributionCount: 1, date: "2026-01-03" },
    ];
    expect(calculateConsistency(days)).toBe(100);
  });

  it("returns correct ratio for partial activity", () => {
    const days = [
      { contributionCount: 5, date: "2026-01-01" },
      { contributionCount: 0, date: "2026-01-02" },
      { contributionCount: 1, date: "2026-01-03" },
      { contributionCount: 0, date: "2026-01-04" },
    ];
    expect(calculateConsistency(days)).toBe(50);
  });
});

describe("calculateImpact", () => {
  it("returns 0 for zeroed metrics", () => {
    expect(calculateImpact(zeroed)).toBe(0);
  });

  it("increases with PRs merged", () => {
    const low = { ...zeroed, prs_merged: 1 };
    const high = { ...zeroed, prs_merged: 10 };
    expect(calculateImpact(high)).toBeGreaterThan(calculateImpact(low));
  });
});

describe("calculateScores", () => {
  it("returns all three scores", () => {
    const days = [{ contributionCount: 3, date: "2026-01-01" }];
    const scores = calculateScores(baseMetrics, days);
    expect(scores).toHaveProperty("speed_score");
    expect(scores).toHaveProperty("consistency_score");
    expect(scores).toHaveProperty("impact_score");
    expect(scores.speed_score).toBeGreaterThan(0);
    expect(scores.consistency_score).toBe(100);
    expect(scores.impact_score).toBeGreaterThan(0);
  });
});

describe("calculatePitStops", () => {
  it("returns 0 for all-active days", () => {
    const days = [
      { contributionCount: 1, date: "2026-01-01" },
      { contributionCount: 2, date: "2026-01-02" },
    ];
    expect(calculatePitStops(days)).toBe(0);
  });

  it("counts consecutive zero days as one gap", () => {
    const days = [
      { contributionCount: 1, date: "2026-01-01" },
      { contributionCount: 0, date: "2026-01-02" },
      { contributionCount: 0, date: "2026-01-03" },
      { contributionCount: 1, date: "2026-01-04" },
    ];
    expect(calculatePitStops(days)).toBe(1);
  });

  it("counts multiple gaps", () => {
    const days = [
      { contributionCount: 1, date: "2026-01-01" },
      { contributionCount: 0, date: "2026-01-02" },
      { contributionCount: 1, date: "2026-01-03" },
      { contributionCount: 0, date: "2026-01-04" },
    ];
    expect(calculatePitStops(days)).toBe(2);
  });

  it("returns 0 for empty days", () => {
    expect(calculatePitStops([])).toBe(0);
  });
});

describe("findFastestLap", () => {
  it("returns null for empty days", () => {
    expect(findFastestLap([])).toBeNull();
  });

  it("finds day with most contributions", () => {
    const days = [
      { contributionCount: 5, date: "2026-01-01" },
      { contributionCount: 12, date: "2026-01-02" },
      { contributionCount: 3, date: "2026-01-03" },
    ];
    const result = findFastestLap(days);
    expect(result).toEqual({ date: "2026-01-02", count: 12 });
  });
});
