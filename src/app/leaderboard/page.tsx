import { createClient } from "@/lib/supabase/server";
import { StandingsTable } from "@/components/leaderboard/standings-table";
import { Podium } from "@/components/leaderboard/podium";

export const metadata = {
  title: "Standings - GitRace",
  description: "Season standings for the GitHub developer racing championship",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Get active season
  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  // Get all profiles ordered by points
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("total_points", { ascending: false });

  // Get race entries for race results
  const raceEntries = season
    ? (
        await supabase
          .from("race_entries")
          .select("*, races!inner(season_id)")
          .eq("races.season_id", season.id)
          .not("final_position", "is", null)
      ).data
    : [];

  // Build standings
  const entries = (profiles || []).map((profile, i) => {
    const results = (raceEntries || [])
      .filter((e) => e.profile_id === profile.id)
      .map((e) => ({
        position: e.final_position || 0,
        points: e.points_earned || 0,
      }));

    return {
      profileId: profile.id,
      username: profile.github_username,
      avatarUrl: profile.avatar_url || "",
      carColor: profile.car_color || "#ff0000",
      carNumber: profile.car_number || 0,
      totalPoints: profile.total_points || 0,
      position: i + 1,
      raceResults: results,
    };
  });

  const top3 = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-neutral-800">
        <a href="/" className="text-white font-bold text-lg">
          GitRace
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/race"
            className="text-neutral-400 text-sm hover:text-white transition-colors"
          >
            Race
          </a>
          <a
            href="/dashboard"
            className="text-neutral-400 text-sm hover:text-white transition-colors"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-white text-3xl font-bold mb-2">
          {season?.name || "Season"} Standings
        </h1>
        <p className="text-neutral-400 mb-8">
          Championship standings based on weekly race results
        </p>

        {top3.length >= 3 && (
          <Podium
            first={{
              username: top3[0].username,
              avatarUrl: top3[0].avatarUrl,
              carColor: top3[0].carColor,
              totalPoints: top3[0].totalPoints,
            }}
            second={{
              username: top3[1].username,
              avatarUrl: top3[1].avatarUrl,
              carColor: top3[1].carColor,
              totalPoints: top3[1].totalPoints,
            }}
            third={{
              username: top3[2].username,
              avatarUrl: top3[2].avatarUrl,
              carColor: top3[2].carColor,
              totalPoints: top3[2].totalPoints,
            }}
          />
        )}

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 mt-8">
          {entries.length > 0 ? (
            <StandingsTable entries={entries} />
          ) : (
            <div className="text-center py-12 text-neutral-500">
              No drivers have joined yet.{" "}
              <a href="/login" className="text-red-400 hover:underline">
                Be the first!
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
