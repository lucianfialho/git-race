import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncProfileActivity, syncProfileStats } from "@/lib/github/sync";
import { getMostRelevantGP, getNow } from "@/lib/f1/calendar";
import { checkContributionAchievements } from "@/lib/race/achievements";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get profile
  const { data: profile } = await admin
    .from("profiles")
    .select("id, github_token, github_username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found. Try logging out and back in." },
      { status: 400 }
    );
  }

  if (!profile.github_token) {
    return NextResponse.json(
      { error: "No GitHub token found. Please log out and sign in again to grant access." },
      { status: 400 }
    );
  }

  // Use the current/next GP's qualifying period for sync, or fallback to current week
  const now = getNow();
  const gp = getMostRelevantGP(now);

  let periodStart: Date;
  let periodEnd: Date;

  if (gp) {
    periodStart = new Date(gp.dates.qualiStart);
    periodEnd = new Date(gp.dates.raceDate);
  } else {
    // Fallback: current week
    const d = new Date(now);
    const day = d.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    periodStart = new Date(d);
    periodStart.setUTCDate(d.getUTCDate() + diffToMonday);
    periodStart.setUTCHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodStart.getUTCDate() + 6);
    periodEnd.setUTCHours(23, 59, 59, 999);
  }

  // Sync this user's activity
  try {
    const data = await syncProfileActivity(profile, periodStart, periodEnd);

    if (!data) {
      return NextResponse.json(
        { error: "Failed to sync GitHub data. Your token may have expired — try logging out and back in." },
        { status: 500 }
      );
    }

    // Save snapshot
    const { error: upsertError } = await admin.from("activity_snapshots").upsert(
      {
        profile_id: profile.id,
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
        ...data,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,period_start,period_end" }
    );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save activity data" },
        { status: 500 }
      );
    }

    // Fetch GitHub profile stats (stars, repos, followers) in parallel
    const profileStats = await syncProfileStats(profile);

    // Calculate overall rating as base points (before race results add more)
    const overallRating = Math.round(
      (data.power_unit_score * 0.25 +
       data.aero_score * 0.25 +
       data.reliability_score * 0.2 +
       data.tire_mgmt_score * 0.15 +
       data.strategy_score * 0.15) * 2
    );

    // Update car_stats + github_stats + points on profile
    const profileUpdate: Record<string, unknown> = {
      car_stats: {
        power_unit: data.power_unit_score,
        aero: data.aero_score,
        reliability: data.reliability_score,
        tire_mgmt: data.tire_mgmt_score,
        strategy: data.strategy_score,
      },
      total_points: overallRating,
    };
    if (profileStats) {
      profileUpdate.github_stats = profileStats;
    }

    await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", profile.id);

    // Check contribution-based achievements
    let newAchievements: string[] = [];
    try {
      const unlocked = await checkContributionAchievements(profile.id, admin);
      newAchievements = unlocked.map((a) => a.slug);
    } catch (err) {
      console.error("Achievement check failed:", err);
    }

    return NextResponse.json({
      success: true,
      gp: gp?.name ?? "Current week",
      metrics: {
        commits: data.commits_count,
        prs_merged: data.prs_merged,
        prs_reviewed: data.prs_reviewed,
        issues: data.issues_opened + data.issues_closed,
      },
      achievements: newAchievements,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed. Check console for details." },
      { status: 500 }
    );
  }
}
