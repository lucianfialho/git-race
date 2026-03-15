import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getOrCreateCurrentRace,
  calculateRacePositions,
  finalizeRace,
} from "@/lib/race/engine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date();

    // Check if any active race has ended
    const { data: expiredRaces } = await admin
      .from("races")
      .select("*")
      .eq("status", "active")
      .lt("period_end", now.toISOString());

    if (expiredRaces && expiredRaces.length > 0) {
      for (const race of expiredRaces) {
        await calculateRacePositions(race.id);
        await finalizeRace(race.id);
      }
    }

    // Ensure current race exists and calculate positions
    const currentRace = await getOrCreateCurrentRace();
    const result = await calculateRacePositions(currentRace.id);

    return NextResponse.json({
      success: true,
      currentRace: currentRace.name,
      finalized: expiredRaces?.length ?? 0,
      ...result,
    });
  } catch (error) {
    console.error("Race calculation failed:", error);
    return NextResponse.json(
      { error: "Calculation failed" },
      { status: 500 }
    );
  }
}
