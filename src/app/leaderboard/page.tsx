import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LeaderboardTabs } from "./leaderboard-tabs";

export const metadata = {
  title: "Standings - GitRace",
  description: "Season standings for the GitHub developer racing championship",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("total_points", { ascending: false });

  const raceEntries = season
    ? (
        await supabase
          .from("race_entries")
          .select("*, races!inner(season_id)")
          .eq("races.season_id", season.id)
          .not("final_position", "is", null)
      ).data
    : [];

  // Build driver standings
  const drivers = (profiles || []).map((profile, i) => {
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
      carNumber: profile.car_number || 0,
      totalPoints: profile.total_points || 0,
      position: i + 1,
      wins: results.filter((r) => r.position === 1).length,
      podiums: results.filter((r) => r.position <= 3).length,
    };
  });

  // Build org standings
  const orgMap = new Map<string, { name: string; totalPoints: number; drivers: number; members: string[] }>();
  for (const p of profiles || []) {
    const orgs: string[] = (p.github_stats as Record<string, unknown>)?.organizations as string[] ?? [];
    for (const org of orgs) {
      const existing = orgMap.get(org);
      if (existing) {
        existing.totalPoints += p.total_points || 0;
        existing.drivers += 1;
        if (existing.members.length < 3) existing.members.push(p.avatar_url || "");
      } else {
        orgMap.set(org, {
          name: org,
          totalPoints: p.total_points || 0,
          drivers: 1,
          members: [p.avatar_url || ""],
        });
      }
    }
  }
  const orgs = Array.from(orgMap.values())
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="f1-heading text-3xl text-[#0a0a0a] mb-1">
          {season?.name || "Season"} Standings
        </h1>
        <p className="text-[#a3a3a3] text-sm mb-6">
          Championship standings based on race results
        </p>

        <LeaderboardTabs drivers={drivers} orgs={orgs} />
      </div>
    </div>
  );
}
