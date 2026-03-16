import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMostRelevantGP, getGPStatus, getNow } from "@/lib/f1/calendar";
import { simulateRace, type RaceDriver, type RaceConfig } from "@/lib/race/simulation";
import { fillGridWithBots } from "@/lib/race/matchmaking";
import { saveSnapshot, loadSnapshotAdmin, type RaceDataSnapshot } from "@/lib/race/snapshots";

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
    if (status !== "race_day" && status !== "sprint") {
      return NextResponse.json({ message: `GP ${gp.name} is not race day (status: ${status})` });
    }

    const admin = createAdminClient();

    // Get all profiles with car_stats
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, github_username, car_stats, total_points")
      .not("car_stats", "is", null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No profiles with car stats" });
    }

    // Fill grid with bots
    const realDrivers = profiles.map((p) => ({ profileId: p.id }));
    const grid = fillGridWithBots(realDrivers, 1, gp.slug);

    // Build race drivers with grid positions (using car stats as qualifying proxy)
    const raceDrivers: RaceDriver[] = grid.map((slot, i) => {
      if (slot.isBot) {
        return {
          profileId: slot.botName ?? `bot-${i}`,
          name: slot.botName ?? "Bot",
          carStats: slot.botStats!,
          gridPosition: i + 1,
          isBot: true,
        };
      }
      const profile = profiles.find((p) => p.id === slot.profileId);
      return {
        profileId: slot.profileId!,
        name: profile?.github_username ?? "Unknown",
        carStats: profile?.car_stats ?? { power_unit: 30, aero: 30, reliability: 30, tire_mgmt: 30, strategy: 30 },
        gridPosition: i + 1,
        isBot: false,
      };
    });

    const isSprint = status === "sprint";
    const config: RaceConfig = {
      totalLaps: isSprint ? 20 : 57,
      isSprint,
      seed: `${gp.slug}-${isSprint ? "sprint" : "race"}`,
      weatherChance: 0.3,
    };

    const result = simulateRace(raceDrivers, config);

    // Update points for real drivers
    for (const driverResult of result.results) {
      if (driverResult.points > 0) {
        const profile = profiles.find((p) => p.id === driverResult.profileId);
        if (profile) {
          await admin
            .from("profiles")
            .update({ total_points: (profile.total_points || 0) + driverResult.points })
            .eq("id", profile.id);
        }
      }
    }

    // Save race snapshot to DB (preserve existing qualifying data)
    const existingSnapshot = await loadSnapshotAdmin(gp.slug);
    const raceSnapData: RaceDataSnapshot = {
      results: result.results.map((r) => {
        const profile = profiles.find((p) => p.id === r.profileId);
        return {
          position: r.finalPosition,
          name: r.name,
          profileId: r.profileId,
          isBot: r.isBot,
          avatarUrl: profile?.github_username ? "" : "",
          gridPosition: r.gridPosition,
          points: r.points,
          fastestLap: r.fastestLap,
          dnf: r.dnf,
          dnfReason: r.dnfReason,
          gap: r.gapToLeader,
        };
      }),
      events: result.events.map((e) => ({ lap: e.lap, type: e.type, description: e.description })),
      hadRain: result.hadRain,
      safetyCars: result.safetyCars,
    };

    try {
      await saveSnapshot(
        gp.slug,
        existingSnapshot?.qualifying_data ?? null,
        raceSnapData
      );
    } catch (err) {
      console.error("Failed to save race snapshot:", err);
    }

    return NextResponse.json({
      success: true,
      gp: gp.name,
      type: isSprint ? "sprint" : "race",
      podium: result.results.slice(0, 3).map((r) => ({
        position: r.finalPosition,
        driver: r.name,
        points: r.points,
      })),
      events: result.events.length,
      hadRain: result.hadRain,
      safetyCars: result.safetyCars,
    });
  } catch (error) {
    console.error("Race simulation failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
