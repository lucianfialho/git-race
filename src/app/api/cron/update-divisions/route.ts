import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDivisionMoves } from "@/lib/race/matchmaking";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Get all profiles ordered by points (as proxy for race results)
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, github_username, total_points, division_id")
      .order("total_points", { ascending: false });

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No profiles" });
    }

    // Build results format for division calculator
    const results = profiles.map((p, i) => ({
      profileId: p.id,
      finalPosition: i + 1,
      isBot: false,
    }));

    // Calculate moves (assuming everyone is in F3/level 1 for now)
    const moves = calculateDivisionMoves(results, 1);

    return NextResponse.json({
      success: true,
      totalDrivers: profiles.length,
      moves: moves.length,
      promotions: moves.filter((m) => m.reason === "promotion").length,
      relegations: moves.filter((m) => m.reason === "relegation").length,
    });
  } catch (error) {
    console.error("Division update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
