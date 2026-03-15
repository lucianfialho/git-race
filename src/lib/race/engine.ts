import { createAdminClient } from "../supabase/admin";
import { calculateSpeed } from "./metrics";
import { calculateRacePoints } from "./scoring";

const TRACK_NAMES = [
  "Interlagos",
  "Monza",
  "Silverstone",
  "Spa-Francorchamps",
  "Suzuka",
  "Monaco",
  "Circuit of the Americas",
  "Melbourne",
  "Barcelona",
  "Red Bull Ring",
  "Hungaroring",
  "Zandvoort",
  "Singapore",
  "Jeddah",
  "Bahrain",
  "Imola",
  "Montreal",
  "Baku",
  "Miami",
  "Las Vegas",
  "Abu Dhabi",
  "Shanghai",
];

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() + diffToMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

export async function getOrCreateActiveSeason() {
  const admin = createAdminClient();
  const now = new Date();
  const year = now.getUTCFullYear();

  // Check for active season
  const { data: existing } = await admin
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  if (existing) return existing;

  // Create new season (calendar year)
  const { data: season, error } = await admin
    .from("seasons")
    .insert({
      name: `Season ${year}`,
      slug: `season-${year}`,
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return season;
}

export async function getOrCreateCurrentRace() {
  const admin = createAdminClient();
  const season = await getOrCreateActiveSeason();
  const { start, end } = getWeekBounds(new Date());

  // Check for existing race this week
  const { data: existing } = await admin
    .from("races")
    .select("*")
    .eq("season_id", season.id)
    .eq("status", "active")
    .gte("period_start", start.toISOString())
    .lte("period_end", end.toISOString())
    .single();

  if (existing) return existing;

  // Get next race number
  const { count } = await admin
    .from("races")
    .select("*", { count: "exact", head: true })
    .eq("season_id", season.id);

  const raceNumber = (count ?? 0) + 1;
  const trackName = TRACK_NAMES[(raceNumber - 1) % TRACK_NAMES.length];
  const slug = `${season.slug}-r${raceNumber}-${trackName
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  const { data: race, error } = await admin
    .from("races")
    .insert({
      season_id: season.id,
      name: `Race ${raceNumber}: ${trackName}`,
      slug,
      race_number: raceNumber,
      period_start: start.toISOString(),
      period_end: end.toISOString(),
      status: "active",
      track_config: { name: trackName },
    })
    .select()
    .single();

  if (error) throw error;
  return race;
}

export async function calculateRacePositions(raceId: string) {
  const admin = createAdminClient();

  // Get race details
  const { data: race } = await admin
    .from("races")
    .select("*")
    .eq("id", raceId)
    .single();

  if (!race) throw new Error(`Race ${raceId} not found`);

  // Get all profiles with their activity snapshots for this race period
  const periodStart = race.period_start.split("T")[0];
  const periodEnd = race.period_end.split("T")[0];

  const { data: snapshots } = await admin
    .from("activity_snapshots")
    .select("*, profiles(*)")
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd);

  if (!snapshots || snapshots.length === 0) return;

  // Calculate speed for each driver
  const drivers = snapshots
    .map((s) => ({
      profileId: s.profile_id as string,
      speed: calculateSpeed({
        commits_count: s.commits_count,
        prs_opened: s.prs_opened,
        prs_merged: s.prs_merged,
        prs_reviewed: s.prs_reviewed,
        issues_opened: s.issues_opened,
        issues_closed: s.issues_closed,
        lines_added: s.lines_added,
        lines_deleted: s.lines_deleted,
        repos_contributed_to: s.repos_contributed_to,
      }),
      consistency: s.consistency_score,
      totalActivity:
        s.commits_count +
        s.prs_opened +
        s.prs_merged +
        s.issues_opened +
        s.issues_closed,
      pitStops: s.consistency_score < 30 ? 2 : s.consistency_score < 60 ? 1 : 0,
    }))
    .sort((a, b) => b.speed - a.speed);

  // Find fastest lap (highest speed)
  const fastestDriverId = drivers[0]?.profileId;

  // Upsert race entries
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const position = i + 1;
    const isDNF = driver.totalActivity === 0;
    const lapProgress = isDNF
      ? 0
      : Math.min(100, (driver.speed / (drivers[0]?.speed || 1)) * 100);

    await admin.from("race_entries").upsert(
      {
        race_id: raceId,
        profile_id: driver.profileId,
        grid_position: position,
        current_position: position,
        lap_progress: lapProgress,
        speed: driver.speed,
        pit_stops: driver.pitStops,
        fastest_lap: driver.profileId === fastestDriverId,
        dnf: isDNF,
      },
      { onConflict: "race_id,profile_id" }
    );
  }

  return { driversProcessed: drivers.length };
}

export async function finalizeRace(raceId: string) {
  const admin = createAdminClient();

  // Get all entries sorted by position
  const { data: entries } = await admin
    .from("race_entries")
    .select("*")
    .eq("race_id", raceId)
    .order("current_position", { ascending: true });

  if (!entries) return;

  // Assign final positions and points
  for (const entry of entries) {
    const points = calculateRacePoints(
      entry.current_position,
      entry.fastest_lap,
      entry.dnf
    );

    await admin
      .from("race_entries")
      .update({
        final_position: entry.current_position,
        points_earned: points,
      })
      .eq("id", entry.id);

    // Update total points on profile
    if (points > 0) {
      const { data: profile } = await admin
        .from("profiles")
        .select("total_points")
        .eq("id", entry.profile_id)
        .single();

      if (profile) {
        await admin
          .from("profiles")
          .update({ total_points: (profile.total_points || 0) + points })
          .eq("id", entry.profile_id);
      }
    }
  }

  // Mark race as finished
  await admin
    .from("races")
    .update({ status: "finished" })
    .eq("id", raceId);
}
