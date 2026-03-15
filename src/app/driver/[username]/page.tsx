import { createClient } from "@/lib/supabase/server";
import { DriverCard } from "@/components/driver/driver-card";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return {
    title: `${username} - GitRace Driver Profile`,
    description: `${username}'s racing stats and history on GitRace`,
  };
}

export default async function DriverPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("github_username", username)
    .single();

  if (!profile) notFound();

  const carStats = profile.car_stats ?? {
    power_unit: 0, aero: 0, reliability: 0, tire_mgmt: 0, strategy: 0,
  };

  // Get race entries from old race_entries table (backwards compat)
  const { data: entries } = await supabase
    .from("race_entries")
    .select("*, races(name, slug, status)")
    .eq("profile_id", profile.id)
    .not("final_position", "is", null)
    .order("created_at", { ascending: false });

  const raceResults = entries || [];

  const stats = {
    racesCompleted: raceResults.filter((e) => !e.dnf).length,
    wins: raceResults.filter((e) => e.final_position === 1).length,
    podiums: raceResults.filter((e) => e.final_position && e.final_position <= 3).length,
    fastestLaps: raceResults.filter((e) => e.fastest_lap).length,
    bestFinish: raceResults.reduce(
      (best, e) => (e.final_position && (!best || e.final_position < best) ? e.final_position : best),
      0 as number
    ),
    dnfs: raceResults.filter((e) => e.dnf).length,
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <DriverCard
          username={profile.github_username}
          avatarUrl={profile.avatar_url || ""}
          carNumber={profile.car_number || 0}
          division="F3"
          divisionLevel={1}
          carStats={carStats}
          totalPoints={profile.total_points || 0}
        />

        {/* Season Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
          {[
            { label: "Races", value: stats.racesCompleted },
            { label: "Wins", value: stats.wins },
            { label: "Podiums", value: stats.podiums },
            { label: "Best", value: stats.bestFinish ? `P${stats.bestFinish}` : "-" },
            { label: "Fastest", value: stats.fastestLaps },
            { label: "DNFs", value: stats.dnfs },
          ].map((s) => (
            <div key={s.label} className="bg-neutral-900 rounded-lg border border-neutral-800 p-3 text-center">
              <p className="text-white text-lg font-bold">{s.value}</p>
              <p className="text-neutral-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Race History */}
        <div className="mt-8">
          <h3 className="text-white font-bold text-lg mb-4">Race History</h3>
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            {raceResults.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-xs uppercase">
                    <th className="text-left py-3 px-4">Race</th>
                    <th className="text-right py-3 px-4">Grid</th>
                    <th className="text-right py-3 px-4">Finish</th>
                    <th className="text-right py-3 px-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {raceResults.map((entry) => {
                    const race = entry.races as unknown as { name: string; slug: string };
                    return (
                      <tr key={entry.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="py-3 px-4 text-white text-sm">{race?.name}</td>
                        <td className="py-3 px-4 text-right text-neutral-400 text-sm">P{entry.grid_position}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {entry.dnf ? (
                            <span className="text-red-400">DNF</span>
                          ) : (
                            <span className={entry.final_position <= 3 ? "text-yellow-400 font-bold" : "text-white"}>
                              P{entry.final_position}
                            </span>
                          )}
                          {entry.fastest_lap && <span className="fastest-lap ml-2 text-xs">FL</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-white text-sm font-bold">
                          {entry.points_earned || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-neutral-500">No race history yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
