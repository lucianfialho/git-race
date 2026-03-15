import { describe, it, expect } from "vitest";
import { calculateCarComponents, calculateOverallRating } from "./car-components";

const emptyMetrics = {
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

const emptyDays = [
  { contributionCount: 0, date: "2025-03-10" },
  { contributionCount: 0, date: "2025-03-11" },
  { contributionCount: 0, date: "2025-03-12" },
  { contributionCount: 0, date: "2025-03-13" },
  { contributionCount: 0, date: "2025-03-14" },
  { contributionCount: 0, date: "2025-03-15" },
  { contributionCount: 0, date: "2025-03-16" },
];

const fullDays = emptyDays.map((d) => ({ ...d, contributionCount: 5 }));

describe("calculateCarComponents", () => {
  it("returns all zeros for zero activity", () => {
    const stats = calculateCarComponents(emptyMetrics, emptyDays);
    expect(stats.power_unit).toBe(0);
    expect(stats.aero).toBe(0);
    expect(stats.reliability).toBe(0);
    expect(stats.tire_mgmt).toBe(0);
    expect(stats.strategy).toBe(0);
  });

  it("only commits increases only power_unit", () => {
    const stats = calculateCarComponents(
      { ...emptyMetrics, commits_count: 20 },
      emptyDays
    );
    expect(stats.power_unit).toBeGreaterThan(0);
    expect(stats.aero).toBe(0);
    expect(stats.tire_mgmt).toBe(0);
    expect(stats.strategy).toBe(0);
  });

  it("only PRs increases only aero", () => {
    const stats = calculateCarComponents(
      { ...emptyMetrics, prs_opened: 5, prs_merged: 3 },
      emptyDays
    );
    expect(stats.aero).toBeGreaterThan(0);
    expect(stats.power_unit).toBe(0);
    expect(stats.tire_mgmt).toBe(0);
    expect(stats.strategy).toBe(0);
  });

  it("daily activity gives reliability 100", () => {
    const stats = calculateCarComponents(emptyMetrics, fullDays);
    expect(stats.reliability).toBe(100);
  });

  it("no daily activity gives reliability 0", () => {
    const stats = calculateCarComponents(emptyMetrics, emptyDays);
    expect(stats.reliability).toBe(0);
  });

  it("only reviews increases only tire_mgmt", () => {
    const stats = calculateCarComponents(
      { ...emptyMetrics, prs_reviewed: 10 },
      emptyDays
    );
    expect(stats.tire_mgmt).toBeGreaterThan(0);
    expect(stats.power_unit).toBe(0);
    expect(stats.aero).toBe(0);
    expect(stats.strategy).toBe(0);
  });

  it("only issues increases only strategy", () => {
    const stats = calculateCarComponents(
      { ...emptyMetrics, issues_opened: 5, issues_closed: 3 },
      emptyDays
    );
    expect(stats.strategy).toBeGreaterThan(0);
    expect(stats.power_unit).toBe(0);
    expect(stats.aero).toBe(0);
    expect(stats.tire_mgmt).toBe(0);
  });

  it("all values cap at 100", () => {
    const maxMetrics = {
      commits_count: 100000,
      prs_opened: 100000,
      prs_merged: 100000,
      prs_reviewed: 100000,
      issues_opened: 100000,
      issues_closed: 100000,
      lines_added: 100000,
      lines_deleted: 100000,
      repos_contributed_to: 100000,
    };
    const stats = calculateCarComponents(maxMetrics, fullDays);
    expect(stats.power_unit).toBeLessThanOrEqual(100);
    expect(stats.aero).toBeLessThanOrEqual(100);
    expect(stats.reliability).toBeLessThanOrEqual(100);
    expect(stats.tire_mgmt).toBeLessThanOrEqual(100);
    expect(stats.strategy).toBeLessThanOrEqual(100);
  });

  it("realistic dev profile has mixed stats", () => {
    const stats = calculateCarComponents(
      {
        commits_count: 15,
        prs_opened: 4,
        prs_merged: 3,
        prs_reviewed: 6,
        issues_opened: 2,
        issues_closed: 1,
        lines_added: 500,
        lines_deleted: 200,
        repos_contributed_to: 3,
      },
      [
        { contributionCount: 8, date: "2025-03-10" },
        { contributionCount: 5, date: "2025-03-11" },
        { contributionCount: 0, date: "2025-03-12" },
        { contributionCount: 3, date: "2025-03-13" },
        { contributionCount: 12, date: "2025-03-14" },
        { contributionCount: 0, date: "2025-03-15" },
        { contributionCount: 2, date: "2025-03-16" },
      ]
    );
    expect(stats.power_unit).toBeGreaterThan(0);
    expect(stats.aero).toBeGreaterThan(0);
    expect(stats.reliability).toBeCloseTo(71.4, 0);
    expect(stats.tire_mgmt).toBeGreaterThan(0);
    expect(stats.strategy).toBeGreaterThan(0);
  });
});

describe("calculateOverallRating", () => {
  it("returns 0 for zero stats", () => {
    expect(
      calculateOverallRating({
        power_unit: 0,
        aero: 0,
        reliability: 0,
        tire_mgmt: 0,
        strategy: 0,
      })
    ).toBe(0);
  });

  it("returns weighted average", () => {
    const rating = calculateOverallRating({
      power_unit: 80,
      aero: 60,
      reliability: 100,
      tire_mgmt: 40,
      strategy: 50,
    });
    // 80*0.25 + 60*0.25 + 100*0.2 + 40*0.15 + 50*0.15 = 20+15+20+6+7.5 = 68.5
    expect(rating).toBe(68.5);
  });

  it("returns 100 for maxed stats", () => {
    expect(
      calculateOverallRating({
        power_unit: 100,
        aero: 100,
        reliability: 100,
        tire_mgmt: 100,
        strategy: 100,
      })
    ).toBe(100);
  });
});
