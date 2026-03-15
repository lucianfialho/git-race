import { describe, it, expect } from "vitest";
import { detectRivals, calculateHeadToHead } from "./rivalries";

const standings = [
  { profileId: "p1", name: "Driver 1", points: 100, position: 1, isBot: false },
  { profileId: "p2", name: "Driver 2", points: 95, position: 2, isBot: false },
  { profileId: "p3", name: "Driver 3", points: 80, position: 3, isBot: false },
  { profileId: "p4", name: "Driver 4", points: 78, position: 4, isBot: false },
  { profileId: "p5", name: "Driver 5", points: 30, position: 5, isBot: false },
];

describe("detectRivals", () => {
  it("finds closest rival above and below", () => {
    const rivals = detectRivals("p3", standings);
    expect(rivals).toContain("p2");
    expect(rivals).toContain("p4");
  });

  it("returns max 2 rivals", () => {
    const rivals = detectRivals("p2", standings);
    expect(rivals.length).toBeLessThanOrEqual(2);
  });

  it("returns adjacent driver if no close rivals by points", () => {
    const rivals = detectRivals("p5", standings);
    expect(rivals.length).toBeGreaterThan(0);
  });

  it("returns empty for unknown profile", () => {
    expect(detectRivals("unknown", standings)).toEqual([]);
  });

  it("handles leader (only rival below)", () => {
    const rivals = detectRivals("p1", standings);
    expect(rivals.length).toBeGreaterThan(0);
    expect(rivals).toContain("p2");
  });
});

describe("calculateHeadToHead", () => {
  const races = [
    {
      gpId: "gp1",
      results: [
        { profileId: "p1", finalPosition: 1 },
        { profileId: "p2", finalPosition: 3 },
      ],
    },
    {
      gpId: "gp2",
      results: [
        { profileId: "p1", finalPosition: 5 },
        { profileId: "p2", finalPosition: 2 },
      ],
    },
    {
      gpId: "gp3",
      results: [
        { profileId: "p1", finalPosition: 2 },
        { profileId: "p2", finalPosition: 4 },
      ],
    },
  ];

  it("calculates correct wins and losses", () => {
    const h2h = calculateHeadToHead("p1", "p2", races);
    expect(h2h.wins).toBe(2);
    expect(h2h.losses).toBe(1);
  });

  it("inverse for the other driver", () => {
    const h2h = calculateHeadToHead("p2", "p1", races);
    expect(h2h.wins).toBe(1);
    expect(h2h.losses).toBe(2);
  });

  it("returns 0-0 with no shared races", () => {
    const h2h = calculateHeadToHead("p1", "p99", races);
    expect(h2h.wins).toBe(0);
    expect(h2h.losses).toBe(0);
  });
});
