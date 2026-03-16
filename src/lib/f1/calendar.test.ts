import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getGPStatus,
  getCurrentGP,
  getNextGP,
  getGPBySlug,
  isQualifyingActive,
  isRaceDay,
  F1_2025_CALENDAR,
  F1_2026_CALENDAR,
  ALL_GPS,
} from "./calendar";

describe("getGPStatus", () => {
  const australia = F1_2025_CALENDAR[0]; // Round 1

  it("returns upcoming before qualifying starts", () => {
    const before = new Date("2025-03-09T00:00:00Z");
    expect(getGPStatus(australia, before)).toBe("upcoming");
  });

  it("returns qualifying during qualifying period", () => {
    const during = new Date("2025-03-12T12:00:00Z");
    expect(getGPStatus(australia, during)).toBe("qualifying");
  });

  it("returns race_day on race day", () => {
    const raceDay = new Date("2025-03-16T06:00:00Z");
    expect(getGPStatus(australia, raceDay)).toBe("race_day");
  });

  it("returns finished after race", () => {
    const after = new Date("2025-03-16T10:00:00Z");
    expect(getGPStatus(australia, after)).toBe("finished");
  });

  it("returns sprint during sprint for sprint weekend", () => {
    const china = F1_2025_CALENDAR[1]; // Sprint weekend
    const sprintTime = new Date("2025-03-22T07:30:00Z");
    expect(getGPStatus(china, sprintTime)).toBe("sprint");
  });
});

describe("getCurrentGP", () => {
  it("returns null when no GP is active", () => {
    const offWeek = new Date("2025-03-25T00:00:00Z");
    expect(getCurrentGP(offWeek)).toBeNull();
  });

  it("returns active GP during qualifying", () => {
    const qualiDay = new Date("2025-03-12T12:00:00Z");
    const gp = getCurrentGP(qualiDay);
    expect(gp).not.toBeNull();
    expect(gp!.slug).toBe("australia-2025");
  });

  it("returns active GP on race day", () => {
    const raceDay = new Date("2025-03-16T06:00:00Z");
    const gp = getCurrentGP(raceDay);
    expect(gp).not.toBeNull();
    expect(gp!.slug).toBe("australia-2025");
  });
});

describe("getNextGP", () => {
  it("returns first GP at start of season", () => {
    const jan = new Date("2025-01-01T00:00:00Z");
    const gp = getNextGP(jan);
    expect(gp).not.toBeNull();
    expect(gp!.round).toBe(1);
  });

  it("returns current active GP during qualifying", () => {
    const qualiDay = new Date("2025-03-12T12:00:00Z");
    const gp = getNextGP(qualiDay);
    expect(gp).not.toBeNull();
    expect(gp!.slug).toBe("australia-2025");
  });

  it("returns 2026 GP after 2025 season ends", () => {
    const afterSeason2025 = new Date("2025-12-08T00:00:00Z");
    const gp = getNextGP(afterSeason2025);
    expect(gp).not.toBeNull();
    expect(gp!.slug).toContain("2026");
  });

  it("returns null after all GPs finished", () => {
    const afterAll = new Date("2027-01-01T00:00:00Z");
    const gp = getNextGP(afterAll);
    expect(gp).toBeNull();
  });
});

describe("getGPBySlug", () => {
  it("finds GP by slug", () => {
    const gp = getGPBySlug("monaco-2025");
    expect(gp).not.toBeNull();
    expect(gp!.name).toBe("Monaco Grand Prix");
  });

  it("returns null for invalid slug", () => {
    expect(getGPBySlug("invalid")).toBeNull();
  });
});

describe("isQualifyingActive", () => {
  it("returns true during qualifying", () => {
    const australia = F1_2025_CALENDAR[0];
    expect(isQualifyingActive(australia, new Date("2025-03-12T12:00:00Z"))).toBe(true);
  });

  it("returns false before qualifying", () => {
    const australia = F1_2025_CALENDAR[0];
    expect(isQualifyingActive(australia, new Date("2025-03-09T00:00:00Z"))).toBe(false);
  });
});

describe("isRaceDay", () => {
  it("returns true on race day", () => {
    const australia = F1_2025_CALENDAR[0];
    expect(isRaceDay(australia, new Date("2025-03-16T06:00:00Z"))).toBe(true);
  });

  it("returns false during qualifying", () => {
    const australia = F1_2025_CALENDAR[0];
    expect(isRaceDay(australia, new Date("2025-03-12T12:00:00Z"))).toBe(false);
  });
});

describe("F1_2025_CALENDAR", () => {
  it("has 24 GPs", () => {
    expect(F1_2025_CALENDAR).toHaveLength(24);
  });

  it("has 7 sprint weekends", () => {
    const sprints = F1_2025_CALENDAR.filter((gp) => gp.hasSprint);
    expect(sprints.length).toBe(7);
  });

  it("rounds are sequential 1-24", () => {
    F1_2025_CALENDAR.forEach((gp, i) => {
      expect(gp.round).toBe(i + 1);
    });
  });

  it("all GPs have theme colors", () => {
    F1_2025_CALENDAR.forEach((gp) => {
      expect(gp.themeColors.primary).toBeTruthy();
      expect(gp.themeColors.secondary).toBeTruthy();
    });
  });
});

describe("F1_2026_CALENDAR", () => {
  it("has 22 GPs", () => {
    expect(F1_2026_CALENDAR).toHaveLength(22);
  });

  it("rounds are sequential 1-22", () => {
    F1_2026_CALENDAR.forEach((gp, i) => {
      expect(gp.round).toBe(i + 1);
    });
  });

  it("all GPs have theme colors", () => {
    F1_2026_CALENDAR.forEach((gp) => {
      expect(gp.themeColors.primary).toBeTruthy();
    });
  });
});

describe("ALL_GPS", () => {
  it("has 46 GPs total (24 + 22)", () => {
    expect(ALL_GPS).toHaveLength(46);
  });

  it("all have unique slugs", () => {
    const slugs = ALL_GPS.map((gp) => gp.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
