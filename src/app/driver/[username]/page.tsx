import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompareLink } from "@/components/driver/compare-link";
import { getDivisionFromPoints } from "@/lib/race/divisions";
import { calculateOverallRating } from "@/lib/race/car-components";
import type { CarStats } from "@/lib/race/car-components";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `${username} - GitRace`, description: `${username}'s racing profile` };
}

const CAR_COMPONENTS = [
  { key: "power_unit" as const, label: "PWR", name: "Power Unit", hint: "Commits" },
  { key: "aero" as const, label: "AER", name: "Aerodynamics", hint: "Pull Requests" },
  { key: "reliability" as const, label: "REL", name: "Reliability", hint: "Daily Activity" },
  { key: "tire_mgmt" as const, label: "TIR", name: "Tire Mgmt", hint: "Code Reviews" },
  { key: "strategy" as const, label: "STR", name: "Strategy", hint: "Issues" },
];

const DIV_COLORS: Record<number, string> = { 1: "#a3a3a3", 2: "#0a0a0a", 3: "#e10600" };

export default async function DriverPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("github_username", username).single();
  if (!profile) notFound();

  const carStats: CarStats = profile.car_stats ?? { power_unit: 0, aero: 0, reliability: 0, tire_mgmt: 0, strategy: 0 };
  const division = getDivisionFromPoints(profile.total_points ?? 0);
  const overall = calculateOverallRating(carStats);
  const divColor = DIV_COLORS[division.level] ?? "#a3a3a3";

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
      {/* ─── Dark Hero: Driver Identity ─── */}
      <section className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: divColor }} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="flex items-center justify-between gap-6">
            {/* Driver info */}
            <div className="flex items-center gap-5">
              <img
                src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
                alt=""
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                style={{ borderColor: divColor }}
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    {profile.github_username}
                  </h1>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                    style={{ background: divColor, color: division.level === 1 ? "#0a0a0a" : "#fff" }}
                  >
                    {division.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-white/40 text-sm">
                  <span className="font-mono">#{profile.car_number || 0}</span>
                  <span className="font-bold tabular-nums">
                    {profile.total_points || 0} <span className="text-[10px] tracking-wider">PTS</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Overall rating */}
            <div className="text-center hidden sm:block">
              <p className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none">{Math.round(overall)}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">Overall</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Car Telemetry: 5 components as horizontal gauges ─── */}
      <section className="border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-5 gap-0 divide-x divide-[#e5e5e5]">
            {CAR_COMPONENTS.map(({ key, label, hint }) => {
              const value = carStats[key];
              return (
                <div key={key} className="py-5 px-3 md:px-4 text-center group">
                  <p className="text-2xl md:text-3xl font-black text-[#0a0a0a] tabular-nums leading-none">{Math.round(value)}</p>
                  <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden mt-2 mx-auto max-w-[80px]">
                    <div className="h-full bg-[#0a0a0a] rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a] mt-2">{label}</p>
                  <p className="text-[9px] text-[#a3a3a3] mt-0.5 hidden md:block">{hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Season Stats Bar ─── */}
      <section className="border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-[#e5e5e5]">
            {[
              { label: "Races", value: stats.races },
              { label: "Wins", value: stats.wins },
              { label: "Podiums", value: stats.podiums },
              { label: "Best", value: stats.best ? `P${String(stats.best).padStart(2, "0")}` : "--" },
              { label: "Fastest Laps", value: stats.fl },
              { label: "DNFs", value: stats.dnfs },
            ].map((s) => (
              <div key={s.label} className="text-center py-4 px-2">
                <p className="text-xl font-black text-[#0a0a0a] tabular-nums">{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Race History Table */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Race History</span>
          </div>
          {results.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                  <th className="text-left py-3 px-5">Race</th>
                  <th className="text-right py-3 px-5">Grid</th>
                  <th className="text-right py-3 px-5">Finish</th>
                  <th className="text-right py-3 px-5">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.map((entry, i) => {
                  const race = entry.races as unknown as { name: string; slug: string };
                  const isPodium = entry.final_position && entry.final_position <= 3;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-[#fafafa]/50"
                      }`}
                    >
                      <td className="py-3 px-5">
                        <Link
                          href={`/gp/${race?.slug ?? "#"}/result/${profile.github_username}`}
                          className="text-sm font-bold text-[#0a0a0a] hover:text-[#e10600] transition-colors uppercase tracking-tight"
                        >
                          {race?.name}
                        </Link>
                      </td>
                      <td className="py-3 px-5 text-right text-sm text-[#a3a3a3] tabular-nums font-mono">
                        {String(entry.grid_position).padStart(2, "0")}
                      </td>
                      <td className="py-3 px-5 text-right text-sm tabular-nums">
                        {entry.dnf ? (
                          <span className="text-[#e10600] font-black uppercase text-xs tracking-wider">DNF</span>
                        ) : (
                          <span className={isPodium ? "font-black text-[#0a0a0a]" : "font-bold text-[#0a0a0a]"}>
                            {String(entry.final_position).padStart(2, "0")}
                          </span>
                        )}
                        {entry.fastest_lap && (
                          <span className="fastest-lap ml-1.5 text-[10px] font-black uppercase tracking-wider">FL</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right text-sm font-black text-[#0a0a0a] tabular-nums">
                        {entry.points_earned ? `+${entry.points_earned}` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-[#a3a3a3] text-sm uppercase tracking-wider">
              No race history yet
            </div>
          )}
        </div>

        {/* Compare with another driver */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden mt-6">
          <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Head to Head</span>
          </div>
          <div className="p-5">
            <CompareLink username={profile.github_username} />
          </div>
        </div>

        {/* Back to standings */}
        <div className="mt-6 text-center">
          <Link
            href="/leaderboard"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
          >
            &larr; Back to Standings
          </Link>
        </div>
      </section>
    </div>
  );
}
