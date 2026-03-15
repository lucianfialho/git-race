import { describe, it, expect } from "vitest";
import {
  getPointsForPosition,
  calculateRacePoints,
} from "./scoring";

describe("getPointsForPosition", () => {
  it("returns correct F1 points for positions 1-10", () => {
    expect(getPointsForPosition(1)).toBe(25);
    expect(getPointsForPosition(2)).toBe(18);
    expect(getPointsForPosition(3)).toBe(15);
    expect(getPointsForPosition(4)).toBe(12);
    expect(getPointsForPosition(5)).toBe(10);
    expect(getPointsForPosition(6)).toBe(8);
    expect(getPointsForPosition(7)).toBe(6);
    expect(getPointsForPosition(8)).toBe(4);
    expect(getPointsForPosition(9)).toBe(2);
    expect(getPointsForPosition(10)).toBe(1);
  });

  it("returns 0 for positions outside top 10", () => {
    expect(getPointsForPosition(11)).toBe(0);
    expect(getPointsForPosition(20)).toBe(0);
    expect(getPointsForPosition(100)).toBe(0);
  });

  it("returns 0 for invalid positions", () => {
    expect(getPointsForPosition(0)).toBe(0);
    expect(getPointsForPosition(-1)).toBe(0);
  });
});

describe("calculateRacePoints", () => {
  it("returns position points for normal finish", () => {
    expect(calculateRacePoints(1, false, false)).toBe(25);
    expect(calculateRacePoints(5, false, false)).toBe(10);
  });

  it("returns 0 for DNF", () => {
    expect(calculateRacePoints(1, false, true)).toBe(0);
    expect(calculateRacePoints(1, true, true)).toBe(0);
  });

  it("adds fastest lap bonus for top 10 finishers", () => {
    expect(calculateRacePoints(1, true, false)).toBe(26); // 25 + 1
    expect(calculateRacePoints(10, true, false)).toBe(2); // 1 + 1
  });

  it("does not add fastest lap bonus for positions outside top 10", () => {
    expect(calculateRacePoints(11, true, false)).toBe(0);
    expect(calculateRacePoints(15, true, false)).toBe(0);
  });

  it("returns 0 for positions outside top 10 without fastest lap", () => {
    expect(calculateRacePoints(11, false, false)).toBe(0);
  });
});
