import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDivisionFromPoints, getDriverZone } from "@/lib/race/divisions";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Get all profiles ordered by points
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, github_username, total_points, division_level")
      .order("total_points", { ascending: false });

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No profiles" });
    }

    const promotions: Array<{ id: string; username: string; from: number; to: number }> = [];
    const relegations: Array<{ id: string; username: string; from: number; to: number }> = [];

    // Group drivers by their current division level
    const byDivision = new Map<number, typeof profiles>();
    for (const p of profiles) {
      const level = p.division_level ?? 1;
      if (!byDivision.has(level)) byDivision.set(level, []);
      byDivision.get(level)!.push(p);
    }

    // Process each division
    for (const [level, divisionDrivers] of byDivision.entries()) {
      // Drivers are already sorted by total_points desc (from the query)
      // but filter to this division and re-index positions
      const sorted = divisionDrivers.sort(
        (a, b) => (b.total_points ?? 0) - (a.total_points ?? 0)
      );

      sorted.forEach((driver, index) => {
        const positionInDiv = index + 1;
        const zone = getDriverZone(positionInDiv, sorted.length, level);

        if (zone === "promotion") {
          promotions.push({
            id: driver.id,
            username: driver.github_username,
            from: level,
            to: level + 1,
          });
        } else if (zone === "relegation") {
          relegations.push({
            id: driver.id,
            username: driver.github_username,
            from: level,
            to: level - 1,
          });
        }
      });
    }

    // Also update division_level based on points thresholds (source of truth)
    for (const p of profiles) {
      const correctDiv = getDivisionFromPoints(p.total_points ?? 0);
      const currentLevel = p.division_level ?? 1;

      if (correctDiv.level !== currentLevel) {
        await admin
          .from("profiles")
          .update({ division_level: correctDiv.level })
          .eq("id", p.id);
      }
    }

    return NextResponse.json({
      success: true,
      totalDrivers: profiles.length,
      promotions: promotions.length,
      relegations: relegations.length,
      moves: [
        ...promotions.map((p) => ({
          ...p,
          reason: "promotion" as const,
        })),
        ...relegations.map((r) => ({
          ...r,
          reason: "relegation" as const,
        })),
      ],
    });
  } catch (error) {
    console.error("Division update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
