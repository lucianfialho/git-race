import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMostRelevantGP, getNow } from "@/lib/f1/calendar";
import { runQualifying, type QualifyingDriver } from "@/lib/race/qualifying";
import { simulateRace, type RaceDriver, type RaceConfig } from "@/lib/race/simulation";
import { fillGridWithBots } from "@/lib/race/matchmaking";
import { checkAndAwardAchievements } from "@/lib/race/achievements";
import { saveSnapshot, type QualifyingSnapshot, type RaceDataSnapshot } from "@/lib/race/snapshots";

/**
 * POST /api/race/simulate
 * Manual trigger to run qualifying + race for the current GP.
 * Must be authenticated. Returns full results.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = getNow();
  const gp = getMostRelevantGP(now);

  if (!gp) {
    return NextResponse.json({ error: "No active GP" }, { status: 400 });
  }

  // Get all profiles with car_stats
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, github_username, avatar_url, car_stats, total_points")
    .not("car_stats", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "No profiles found" }, { status: 400 });
  }

  // Fill grid with bots
  const realDrivers = profiles.map((p) => ({ profileId: p.id }));
  const grid = fillGridWithBots(realDrivers, 1, gp.slug);

  // Build qualifying drivers
  const qualDrivers: QualifyingDriver[] = grid.map((slot) => {
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

  // Run qualifying
  const qualiResults = runQualifying(qualDrivers, `${gp.slug}-quali`);

  // Build race drivers from qualifying grid
  const raceDrivers: RaceDriver[] = qualiResults.map((q) => {
    const qualDriver = qualDrivers.find((d) => d.profileId === q.profileId)!;
    return {
      profileId: q.profileId,
      name: q.name,
      carStats: qualDriver.carStats,
      gridPosition: q.finalPosition,
      isBot: q.isBot,
    };
  });

  // Run race
  const config: RaceConfig = {
    totalLaps: 57,
    isSprint: false,
    seed: `${gp.slug}-race-manual`,
    weatherChance: 0.3,
  };

  const raceResult = simulateRace(raceDrivers, config);

  // Update points for real drivers
  for (const dr of raceResult.results) {
    if (dr.points > 0 && !dr.isBot) {
      const profile = profiles.find((p) => p.id === dr.profileId);
      if (profile) {
        await admin
          .from("profiles")
          .update({ total_points: (profile.total_points || 0) + dr.points })
          .eq("id", profile.id);
      }
    }
  }

  // Check and award achievements for each real driver
  const achievementsAwarded: Record<string, string[]> = {};
  for (const dr of raceResult.results) {
    if (dr.isBot) continue;

    const qualiResult = qualiResults.find((q) => q.profileId === dr.profileId);
    if (!qualiResult) continue;

    try {
      const newAchievements = await checkAndAwardAchievements(
        dr.profileId,
        dr,
        qualiResult,
        raceResult,
        admin
      );
      if (newAchievements.length > 0) {
        achievementsAwarded[dr.profileId] = newAchievements.map((a) => a.slug);
      }
    } catch (err) {
      console.error(`Achievement check failed for ${dr.profileId}:`, err);
    }
  }

  // Save snapshot to DB
  const qualifyingSnapData: QualifyingSnapshot[] = qualiResults.map((r) => {
    const profile = profiles.find((p) => p.github_username === r.name || p.id === r.profileId);
    return {
      position: r.finalPosition,
      name: r.name,
      profileId: r.profileId,
      isBot: r.isBot,
      avatarUrl: profile?.avatar_url ?? "",
      q1Time: r.q1Time,
      q2Time: r.q2Time,
      q3Time: r.q3Time,
      eliminatedIn: r.eliminatedIn,
    };
  });

  const raceSnapData: RaceDataSnapshot = {
    results: raceResult.results.map((r) => {
      const profile = profiles.find((p) => p.github_username === r.name || p.id === r.profileId);
      return {
        position: r.finalPosition,
        name: r.name,
        profileId: r.profileId,
        isBot: r.isBot,
        avatarUrl: profile?.avatar_url ?? "",
        gridPosition: r.gridPosition,
        points: r.points,
        fastestLap: r.fastestLap,
        dnf: r.dnf,
        dnfReason: r.dnfReason,
        gap: r.gapToLeader,
      };
    }),
    events: raceResult.events.map((e) => ({ lap: e.lap, type: e.type, description: e.description })),
    hadRain: raceResult.hadRain,
    safetyCars: raceResult.safetyCars,
  };

  try {
    await saveSnapshot(gp.slug, qualifyingSnapData, raceSnapData);
  } catch (err) {
    console.error("Failed to save race snapshot:", err);
  }

  return NextResponse.json({
    success: true,
    gp: gp.name,
    qualifying: qualiResults.map((r) => ({
      position: r.finalPosition,
      driver: r.name,
      isBot: r.isBot,
      q1: r.q1Time?.toFixed(3),
      q2: r.q2Time?.toFixed(3),
      q3: r.q3Time?.toFixed(3),
      eliminatedIn: r.eliminatedIn,
    })),
    race: {
      podium: raceResult.results.slice(0, 3).map((r) => ({
        position: r.finalPosition,
        driver: r.name,
        gridPosition: r.gridPosition,
        points: r.points,
        fastestLap: r.fastestLap,
      })),
      results: raceResult.results.map((r) => ({
        position: r.finalPosition,
        driver: r.name,
        isBot: r.isBot,
        gridPosition: r.gridPosition,
        points: r.points,
        dnf: r.dnf,
        dnfReason: r.dnfReason,
        fastestLap: r.fastestLap,
        gap: r.gapToLeader?.toFixed(1),
      })),
      events: raceResult.events,
      hadRain: raceResult.hadRain,
      safetyCars: raceResult.safetyCars,
    },
    achievements: achievementsAwarded,
  });
}
