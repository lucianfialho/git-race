import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMostRelevantGP, getGPStatus, getNow } from "@/lib/f1/calendar";
import { runQualifying, type QualifyingDriver } from "@/lib/race/qualifying";
import { fillGridWithBots } from "@/lib/race/matchmaking";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = getNow();
    const gp = getMostRelevantGP(now);

    if (!gp) {
      return NextResponse.json({ message: "No active GP" });
    }

    const status = getGPStatus(gp, now);
    if (status !== "qualifying") {
      return NextResponse.json({ message: `GP ${gp.name} is not in qualifying (status: ${status})` });
    }

    const admin = createAdminClient();

    // Get all profiles with car_stats
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, github_username, car_stats, avatar_url")
      .not("car_stats", "is", null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No profiles with car stats" });
    }

    // Fill grid with bots to reach 20
    const realDrivers = profiles.map((p) => ({ profileId: p.id }));
    const grid = fillGridWithBots(realDrivers, 1, gp.slug);

    // Build qualifying drivers
    const qualifyingDrivers: QualifyingDriver[] = grid.map((slot) => {
      if (slot.isBot) {
        return {
          profileId: slot.botName ?? "bot",
          name: slot.botName ?? "Bot",
          carStats: slot.botStats!,
          isBot: true,
        };
      }
      const profile = profiles.find((p) => p.id === slot.profileId);
      return {
        profileId: slot.profileId!,
        name: profile?.github_username ?? "Unknown",
        carStats: profile?.car_stats ?? { power_unit: 30, aero: 30, reliability: 30, tire_mgmt: 30, strategy: 30 },
        isBot: false,
      };
    });

    // Run qualifying simulation
    const results = runQualifying(qualifyingDrivers, `${gp.slug}-quali`);

    // Store results — upsert into qualifying_results (if table exists)
    // For now, store in a simple format in the race_entries table
    // We'll use the GP slug as identifier
    const qualifyingData = results.map((r) => ({
      gp_slug: gp.slug,
      profile_id: r.isBot ? null : r.profileId,
      is_bot: r.isBot,
      bot_name: r.isBot ? r.name : null,
      position: r.finalPosition,
      q1_time: r.q1Time,
      q2_time: r.q2Time,
      q3_time: r.q3Time,
      eliminated_in: r.eliminatedIn,
    }));

    return NextResponse.json({
      success: true,
      gp: gp.name,
      results: qualifyingData,
    });
  } catch (error) {
    console.error("Qualifying update failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
