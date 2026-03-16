import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DriverCard } from "@/components/driver/driver-card";
import { CompareLink } from "@/components/driver/compare-link";
import { getDivisionFromPoints } from "@/lib/race/divisions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `${username} - GitRace`, description: `${username}'s racing profile` };
}

export default async function DriverPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("github_username", username).single();
  if (!profile) notFound();

  const carStats = profile.car_stats ?? { power_unit: 0, aero: 0, reliability: 0, tire_mgmt: 0, strategy: 0 };
  const division = getDivisionFromPoints(profile.total_points ?? 0);

  const { data: entries } = await supabase
    .from("race_entries")
    .select("*, races(name, slug, status)")
    .eq("profile_id", profile.id)
    .not("final_position", "is", null)
    .order("created_at", { ascending: false });

  const results = entries || [];
  const stats = {
    races: results.filter((e) => !e.dnf).length,
    wins: results.filter((e) => e.final_position === 1).length,
    podiums: results.filter((e) => e.final_position && e.final_position <= 3).length,
    best: results.reduce((b, e) => (e.final_position && (!b || e.final_position < b) ? e.final_position : b), 0 as number),
    fl: results.filter((e) => e.fastest_lap).length,
    dnfs: results.filter((e) => e.dnf).length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <DriverCard
          username={profile.github_username}
          avatarUrl={profile.avatar_url || ""}
          carNumber={profile.car_number || 0}
          division={division.name}
          divisionLevel={division.level}
          carStats={carStats}
          totalPoints={profile.total_points || 0}
        />

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6">
          {[
            { label: "Races", value: stats.races },
            { label: "Wins", value: stats.wins },
            { label: "Podiums", value: stats.podiums },
            { label: "Best", value: stats.best ? `P${stats.best}` : "-" },
            { label: "Fastest", value: stats.fl },
            { label: "DNFs", value: stats.dnfs },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[#e5e5e5] p-3 text-center">
              <p className="text-lg font-black text-[#0a0a0a]">{s.value}</p>
              <p className="text-[#a3a3a3] text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Compare with another driver */}
        <div className="mt-6">
          <h3 className="font-bold text-[#0a0a0a] text-sm">Compare with another driver</h3>
          <CompareLink username={profile.github_username} />
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-[#0a0a0a] mb-4">Race History</h3>
          <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
            {results.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[#a3a3a3] text-xs uppercase">
                    <th className="text-left py-3 px-4 font-semibold">Race</th>
                    <th className="text-right py-3 px-4 font-semibold">Grid</th>
                    <th className="text-right py-3 px-4 font-semibold">Finish</th>
                    <th className="text-right py-3 px-4 font-semibold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((entry) => {
                    const race = entry.races as unknown as { name: string; slug: string };
                    return (
                      <tr key={entry.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                        <td className="py-3 px-4 text-sm font-medium">
                          <Link href={`/gp/${race?.slug ?? "#"}/result/${profile.github_username}`} className="text-[#0a0a0a] hover:text-[#e10600] transition-colors">
                            {race?.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right text-[#a3a3a3] text-sm">P{entry.grid_position}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {entry.dnf ? (
                            <span className="text-[#dc2626] font-bold">DNF</span>
                          ) : (
                            <span className={entry.final_position <= 3 ? "font-black text-[#0a0a0a]" : "text-[#0a0a0a]"}>
                              P{entry.final_position}
                            </span>
                          )}
                          {entry.fastest_lap && <span className="fastest-lap ml-1 text-xs font-bold">FL</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-[#0a0a0a] text-sm font-bold">{entry.points_earned || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#a3a3a3]">No race history yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
