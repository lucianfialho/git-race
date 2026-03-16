import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardTabs } from "./leaderboard-tabs";
import { getDivisionFromPoints } from "@/lib/race/divisions";

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

  const drivers = (profiles || []).map((profile, i) => {
    const results = (raceEntries || [])
      .filter((e) => e.profile_id === profile.id)
      .map((e) => ({
        position: e.final_position || 0,
        points: e.points_earned || 0,
      }));

    const div = getDivisionFromPoints(profile.total_points || 0);

    return {
      profileId: profile.id,
      username: profile.github_username,
      avatarUrl: profile.avatar_url || "",
      carNumber: profile.car_number || 0,
      totalPoints: profile.total_points || 0,
      position: i + 1,
      wins: results.filter((r) => r.position === 1).length,
      podiums: results.filter((r) => r.position <= 3).length,
      divisionName: div.name,
      divisionLevel: div.level,
    };
  });

  // Build org standings
  const orgMap = new Map<string, { name: string; totalPoints: number; drivers: number; members: Array<{ avatar: string; username: string }> }>();
  for (const p of profiles || []) {
    const orgs: string[] = (p.github_stats as Record<string, unknown>)?.organizations as string[] ?? [];
    for (const org of orgs) {
      const existing = orgMap.get(org);
      if (existing) {
        existing.totalPoints += p.total_points || 0;
        existing.drivers += 1;
        if (existing.members.length < 4) existing.members.push({ avatar: p.avatar_url || "", username: p.github_username });
      } else {
        orgMap.set(org, {
          name: org,
          totalPoints: p.total_points || 0,
          drivers: 1,
          members: [{ avatar: p.avatar_url || "", username: p.github_username }],
        });
      }
    }
  }
  const orgs = Array.from(orgMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);

  const leaderPoints = drivers[0]?.totalPoints || 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Dark hero header */}
      <section className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#e10600]" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-2">Championship</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Standings
          </h1>
          <p className="text-white/30 text-sm mt-2 uppercase tracking-wider">
            {season?.name || "Season 2026"} — {drivers.length} Drivers
          </p>

          {/* Podium — top 3 inline */}
          {drivers.length >= 3 && (
            <div className="flex items-end gap-4 md:gap-6 mt-8" style={{ order: 1 }}>
              {[
                { entry: drivers[1], pos: 2, barH: "h-16 md:h-20" },
                { entry: drivers[0], pos: 1, barH: "h-20 md:h-28" },
                { entry: drivers[2], pos: 3, barH: "h-12 md:h-14" },
              ].map(({ entry, pos, barH }) => (
                <Link
                  key={pos}
                  href={`/driver/${entry.username}`}
                  className="flex flex-col items-center group flex-1"
                  style={{ order: pos === 1 ? 1 : pos === 2 ? 0 : 2 }}
                >
                  <img
                    src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                    alt=""
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full mb-2 group-hover:scale-110 transition-transform border-2 border-white/10"
                  />
                  <span className="text-white text-xs md:text-sm font-bold truncate max-w-[100px]">{entry.username}</span>
                  <span className="text-white/40 text-xs tabular-nums">{entry.totalPoints} pts</span>
                  <div className={`w-full ${barH} mt-2 rounded-t-sm ${pos === 1 ? "bg-[#e10600]" : "bg-white/10"}`}>
                    <div className="flex items-center justify-center h-full">
                      <span className="text-white/60 text-xs font-black">P{pos}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <LeaderboardTabs drivers={drivers} orgs={orgs} leaderPoints={leaderPoints} />
      </section>
    </div>
  );
}
