import type { SupabaseClient } from "@supabase/supabase-js";
import type { DriverResult, RaceSimulationResult } from "./simulation";
import type { QualifyingResult } from "./qualifying";

export interface UnlockedAchievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Check and award achievements for a driver after a race simulation.
 * Returns a list of newly unlocked achievements.
 */
export async function checkAndAwardAchievements(
  profileId: string,
  raceResult: DriverResult,
  qualifyingResult: QualifyingResult,
  raceSimulation: RaceSimulationResult,
  supabaseAdmin: SupabaseClient
): Promise<UnlockedAchievement[]> {
  // Fetch all achievements keyed by slug
  const { data: allAchievements } = await supabaseAdmin
    .from("achievements")
    .select("id, slug, name, description, icon");

  if (!allAchievements || allAchievements.length === 0) return [];

  const achievementsBySlug = new Map(
    allAchievements.map((a) => [a.slug, a])
  );

  // Fetch already-unlocked achievements for this profile
  const { data: existing } = await supabaseAdmin
    .from("profile_achievements")
    .select("achievement_id")
    .eq("profile_id", profileId);

  const unlockedIds = new Set(
    (existing ?? []).map((e) => e.achievement_id)
  );

  // Determine which achievement slugs to award
  const slugsToAward: string[] = [];

  // "pole_position": qualifyingResult.finalPosition === 1
  if (qualifyingResult.finalPosition === 1) {
    slugsToAward.push("pole_position");
  }

  // "race_winner": raceResult.finalPosition === 1
  if (raceResult.finalPosition === 1) {
    slugsToAward.push("race_winner");
  }

  // "podium": raceResult.finalPosition <= 3
  if (raceResult.finalPosition <= 3) {
    slugsToAward.push("podium");
  }

  // "comeback_king": gained 5+ positions
  if (raceResult.gridPosition - raceResult.finalPosition >= 5) {
    slugsToAward.push("comeback_king");
  }

  // "rain_master": won race AND race had rain
  if (raceResult.finalPosition === 1 && raceSimulation.hadRain) {
    slugsToAward.push("rain_master");
  }

  // "first_win": first time finishing P1 (only if race_winner not already unlocked)
  if (raceResult.finalPosition === 1) {
    const raceWinnerAchievement = achievementsBySlug.get("race_winner");
    if (raceWinnerAchievement && !unlockedIds.has(raceWinnerAchievement.id)) {
      slugsToAward.push("first_win");
    }
  }

  // "first_points": check total_points > 0 on profiles table
  const firstPointsAchievement = achievementsBySlug.get("first_points");
  if (firstPointsAchievement && !unlockedIds.has(firstPointsAchievement.id)) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_points")
      .eq("id", profileId)
      .single();

    if (profile && (profile.total_points ?? 0) > 0) {
      slugsToAward.push("first_points");
    }
  }

  // "consistency_is_key": all 7 days active in the period
  const consistencyAchievement = achievementsBySlug.get("consistency_is_key");
  if (consistencyAchievement && !unlockedIds.has(consistencyAchievement.id)) {
    const isConsistent = await checkConsistency(profileId, supabaseAdmin);
    if (isConsistent) {
      slugsToAward.push("consistency_is_key");
    }
  }

  // Filter out achievements already unlocked and insert new ones
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const slug of slugsToAward) {
    const achievement = achievementsBySlug.get(slug);
    if (!achievement) continue;
    if (unlockedIds.has(achievement.id)) continue;

    const { error } = await supabaseAdmin
      .from("profile_achievements")
      .insert({
        profile_id: profileId,
        achievement_id: achievement.id,
      });

    if (!error) {
      // Mark as unlocked so we don't double-insert within the same call
      unlockedIds.add(achievement.id);
      newlyUnlocked.push({
        slug: achievement.slug,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      });
    }
  }

  return newlyUnlocked;
}

/**
 * Check contribution-based achievements (called after GitHub sync).
 * Checks "first_points" and "consistency_is_key".
 */
export async function checkContributionAchievements(
  profileId: string,
  supabaseAdmin: SupabaseClient
): Promise<UnlockedAchievement[]> {
  const { data: allAchievements } = await supabaseAdmin
    .from("achievements")
    .select("id, slug, name, description, icon")
    .in("slug", ["first_points", "consistency_is_key"]);

  if (!allAchievements || allAchievements.length === 0) return [];

  const { data: existing } = await supabaseAdmin
    .from("profile_achievements")
    .select("achievement_id")
    .eq("profile_id", profileId);

  const unlockedIds = new Set(
    (existing ?? []).map((e) => e.achievement_id)
  );

  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let earned = false;

    if (achievement.slug === "first_points") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("total_points")
        .eq("id", profileId)
        .single();

      earned = !!(profile && (profile.total_points ?? 0) > 0);
    }

    if (achievement.slug === "consistency_is_key") {
      earned = await checkConsistency(profileId, supabaseAdmin);
    }

    if (earned) {
      const { error } = await supabaseAdmin
        .from("profile_achievements")
        .insert({
          profile_id: profileId,
          achievement_id: achievement.id,
        });

      if (!error) {
        unlockedIds.add(achievement.id);
        newlyUnlocked.push({
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
        });
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check if a profile has contributed on all 7 days of their most recent
 * activity snapshot period by looking at the consistency_score.
 * A consistency_score of 100 means every day in the period was active.
 */
async function checkConsistency(
  profileId: string,
  supabaseAdmin: SupabaseClient
): Promise<boolean> {
  const { data: snapshot } = await supabaseAdmin
    .from("activity_snapshots")
    .select("consistency_score, period_start, period_end")
    .eq("profile_id", profileId)
    .order("synced_at", { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) return false;

  // consistency_score of 100 means all days were active
  // Also verify the period spans 7 days
  const start = new Date(snapshot.period_start);
  const end = new Date(snapshot.period_end);
  const daySpan = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return snapshot.consistency_score === 100 && daySpan >= 6;
}
