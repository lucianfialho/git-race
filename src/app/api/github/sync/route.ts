import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfileActivity } from "@/lib/github/sync";
import {
  getOrCreateCurrentRace,
  calculateRacePositions,
} from "@/lib/race/engine";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, github_token, github_username")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.github_token) {
    return NextResponse.json(
      { error: "Profile not found or no GitHub token" },
      { status: 400 }
    );
  }

  // Get current race period
  const race = await getOrCreateCurrentRace();
  const periodStart = new Date(race.period_start);
  const periodEnd = new Date(race.period_end);

  // Sync this user's activity
  const data = await syncProfileActivity(profile, periodStart, periodEnd);

  if (!data) {
    return NextResponse.json(
      { error: "Failed to sync GitHub data" },
      { status: 500 }
    );
  }

  // Save snapshot
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin.from("activity_snapshots").upsert(
    {
      profile_id: profile.id,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
      ...data,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,period_start,period_end" }
  );

  // Recalculate race positions
  await calculateRacePositions(race.id);

  return NextResponse.json({
    success: true,
    race: race.name,
    metrics: data,
  });
}
