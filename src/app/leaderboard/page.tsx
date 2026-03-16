import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Standings - GitRace",
  description: "Season standings for the GitHub developer racing championship",
};

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
      carNumber: profile.car_number || 0,
      totalPoints: profile.total_points || 0,
      position: i + 1,
      wins: results.filter((r) => r.position === 1).length,
      podiums: results.filter((r) => r.position <= 3).length,
    };
  });

  const top3 = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="f1-heading text-3xl text-[#0a0a0a] mb-1">
          {season?.name || "Season"} Standings
        </h1>
        <p className="text-[#a3a3a3] text-sm mb-8">
          Championship standings based on race results
        </p>

        {/* Podium */}
        {top3.length >= 3 && (
          <div className="flex items-end justify-center gap-6 mb-10 pt-4">
            {[
              { entry: top3[1], pos: "P2", h: "h-24", order: 1 },
              { entry: top3[0], pos: "P1", h: "h-32", order: 2 },
              { entry: top3[2], pos: "P3", h: "h-16", order: 3 },
            ].map(({ entry, pos, h, order }) => (
              <Link
                key={pos}
                href={`/driver/${entry.username}`}
                className="flex flex-col items-center group"
                style={{ order }}
              >
                <img
                  src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                  alt=""
                  className="w-12 h-12 rounded-full mb-1 group-hover:scale-105 transition-transform"
                />
                <span className="text-[#0a0a0a] text-sm font-bold">{entry.username}</span>
                <span className="text-[#a3a3a3] text-xs">{entry.totalPoints} pts</span>
                <span className="text-xs font-bold text-[#a3a3a3] mt-1">{pos}</span>
                <div className={`w-20 ${h} rounded-t-lg mt-1 ${pos === "P1" ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]"}`} />
              </Link>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-[#e5e5e5] overflow-hidden">
          {entries.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[#a3a3a3] text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 w-12 font-semibold">Pos</th>
                  <th className="text-left py-3 px-4 font-semibold">Driver</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold">Points</th>
                  <th className="text-right py-3 px-4 w-16 font-semibold hidden sm:table-cell">Wins</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold hidden sm:table-cell">Podiums</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.profileId} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-black ${entry.position <= 3 ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                        {entry.position}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/driver/${entry.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#f5f5f5]" />
                        )}
                        <div>
                          <span className="text-[#0a0a0a] font-bold text-sm">{entry.username}</span>
                          <span className="text-[#a3a3a3] font-mono text-xs ml-2">#{entry.carNumber}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#0a0a0a] font-bold">{entry.totalPoints}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#525252] hidden sm:table-cell">{entry.wins}</td>
                    <td className="py-3 px-4 text-right text-[#525252] hidden sm:table-cell">{entry.podiums}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-[#a3a3a3]">
              No drivers yet.{" "}
              <Link href="/login" className="text-[#e10600] font-semibold hover:underline">Be the first!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
