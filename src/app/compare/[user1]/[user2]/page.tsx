import { createClient } from "@/lib/supabase/server";
import { calculateOverallRating } from "@/lib/race/car-components";
import { getDivisionFromPoints } from "@/lib/race/divisions";
import type { CarStats } from "@/lib/race/car-components";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user1: string; user2: string }>;
}) {
  const { user1, user2 } = await params;
  return {
    title: `${user1} vs ${user2} - GitRace`,
    description: `Head-to-head comparison between ${user1} and ${user2}`,
  };
}

const STAT_COMPONENTS: { key: keyof CarStats; label: string; code: string }[] = [
  { key: "power_unit", label: "Power Unit", code: "PWR" },
  { key: "aero", label: "Aerodynamics", code: "AER" },
  { key: "reliability", label: "Reliability", code: "REL" },
  { key: "tire_mgmt", label: "Tire Mgmt", code: "TIR" },
  { key: "strategy", label: "Strategy", code: "STR" },
];

interface GithubStats {
  total_stars?: number;
  total_repos?: number;
  followers?: number;
  following?: number;
  top_languages?: string[];
}

interface ProfileData {
  github_username: string;
  avatar_url: string | null;
  car_number: number | null;
  total_points: number | null;
  car_stats: CarStats | null;
  github_stats: GithubStats | null;
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ user1: string; user2: string }>;
}) {
  const { user1, user2 } = await params;
  const supabase = await createClient();

  const [{ data: profile1 }, { data: profile2 }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "github_username, avatar_url, car_number, total_points, car_stats, github_stats"
      )
      .eq("github_username", user1)
      .single(),
    supabase
      .from("profiles")
      .select(
        "github_username, avatar_url, car_number, total_points, car_stats, github_stats"
      )
      .eq("github_username", user2)
      .single(),
  ]);

  if (!profile1 || !profile2) notFound();

  const p1 = profile1 as unknown as ProfileData;
  const p2 = profile2 as unknown as ProfileData;

  const stats1: CarStats = p1.car_stats ?? {
    power_unit: 0,
    aero: 0,
    reliability: 0,
    tire_mgmt: 0,
    strategy: 0,
  };
  const stats2: CarStats = p2.car_stats ?? {
    power_unit: 0,
    aero: 0,
    reliability: 0,
    tire_mgmt: 0,
    strategy: 0,
  };

  const overall1 = calculateOverallRating(stats1);
  const overall2 = calculateOverallRating(stats2);

  const points1 = p1.total_points ?? 0;
  const points2 = p2.total_points ?? 0;

  const div1 = getDivisionFromPoints(points1);
  const div2 = getDivisionFromPoints(points2);

  const gh1 = p1.github_stats ?? {};
  const gh2 = p2.github_stats ?? {};

  // Determine overall winner
  let winsLeft = 0;
  let winsRight = 0;

  STAT_COMPONENTS.forEach(({ key }) => {
    if (stats1[key] > stats2[key]) winsLeft++;
    else if (stats2[key] > stats1[key]) winsRight++;
  });
  if (points1 > points2) winsLeft++;
  else if (points2 > points1) winsRight++;
  if (overall1 > overall2) winsLeft++;
  else if (overall2 > overall1) winsRight++;

  const overallWinner =
    winsLeft > winsRight ? "left" : winsRight > winsLeft ? "right" : "tie";

  function catWinner(a: number, b: number): "left" | "right" | "tie" {
    if (a > b) return "left";
    if (b > a) return "right";
    return "tie";
  }

  const DIV_COLORS: Record<number, string> = { 1: "#a3a3a3", 2: "#525252", 3: "#e10600" };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Dark Hero: Face-to-Face ─── */}
      <section className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#e10600]" />

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Back link */}
          <Link
            href="/leaderboard"
            className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white/60 transition-colors"
          >
            &larr; Standings
          </Link>

          {/* Section label */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mt-6 mb-6">
            Head to Head
          </p>

          {/* Driver face-off */}
          <div className="flex items-center justify-between gap-4">
            {/* Left driver */}
            <Link
              href={`/driver/${p1.github_username}`}
              className="flex flex-col items-center group flex-1"
            >
              <img
                src={p1.avatar_url || `https://github.com/${p1.github_username}.png`}
                alt={p1.github_username}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 group-hover:scale-105 transition-transform"
                style={{ borderColor: DIV_COLORS[div1.level] ?? "#a3a3a3" }}
              />
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mt-3">
                {p1.github_username}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs font-mono">
                  #{p1.car_number || 0}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: DIV_COLORS[div1.level],
                    color: div1.level === 1 ? "#0a0a0a" : "#fff",
                  }}
                >
                  {div1.name}
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums mt-3 leading-none">
                {Math.round(overall1)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">
                Overall
              </p>
            </Link>

            {/* VS divider */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-px h-8 bg-white/10" />
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] my-2">
                vs
              </span>
              <div className="w-px h-8 bg-white/10" />
            </div>

            {/* Right driver */}
            <Link
              href={`/driver/${p2.github_username}`}
              className="flex flex-col items-center group flex-1"
            >
              <img
                src={p2.avatar_url || `https://github.com/${p2.github_username}.png`}
                alt={p2.github_username}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 group-hover:scale-105 transition-transform"
                style={{ borderColor: DIV_COLORS[div2.level] ?? "#a3a3a3" }}
              />
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mt-3">
                {p2.github_username}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs font-mono">
                  #{p2.car_number || 0}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: DIV_COLORS[div2.level],
                    color: div2.level === 1 ? "#0a0a0a" : "#fff",
                  }}
                >
                  {div2.name}
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums mt-3 leading-none">
                {Math.round(overall2)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">
                Overall
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Verdict Banner ─── */}
      <section className="border-b-2 border-[#e10600]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-4 py-4">
            {overallWinner === "tie" ? (
              <p className="text-sm md:text-base font-black uppercase tracking-[0.15em] text-[#0a0a0a]">
                Dead Heat
              </p>
            ) : (
              <>
                <img
                  src={
                    (overallWinner === "left" ? p1.avatar_url : p2.avatar_url) ||
                    ""
                  }
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-sm md:text-base font-black uppercase tracking-[0.15em] text-[#e10600]">
                  {overallWinner === "left"
                    ? p1.github_username
                    : p2.github_username}{" "}
                  Wins
                </p>
              </>
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
              {winsLeft} &ndash; {winsRight} across all categories
            </span>
          </div>
        </div>
      </section>

      {/* ─── White Content Section ─── */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Championship Points */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
              Championship Points
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-3xl md:text-4xl font-black tabular-nums ${
                  catWinner(points1, points2) === "left"
                    ? "text-[#e10600]"
                    : "text-[#0a0a0a]"
                }`}
              >
                {points1}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                PTS
              </span>
              <span
                className={`text-3xl md:text-4xl font-black tabular-nums ${
                  catWinner(points1, points2) === "right"
                    ? "text-[#e10600]"
                    : "text-[#0a0a0a]"
                }`}
              >
                {points2}
              </span>
            </div>
            {/* Mirrored bar */}
            {(() => {
              const maxPts = Math.max(points1, points2, 1);
              const w = catWinner(points1, points2);
              return (
                <div className="flex gap-0.5 h-2">
                  <div className="flex-1 flex justify-end">
                    <div className="w-full h-full rounded-l-sm bg-[#f0f0f0] relative overflow-hidden">
                      <div
                        className={`absolute right-0 top-0 h-full rounded-l-sm ${
                          w === "left" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                        }`}
                        style={{ width: `${(points1 / maxPts) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-full rounded-r-sm bg-[#f0f0f0] relative overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-r-sm ${
                          w === "right" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                        }`}
                        style={{ width: `${(points2 / maxPts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Car Development — Mirrored Bars */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
              Car Development
            </span>
          </div>
          <div className="p-5 space-y-6">
            {STAT_COMPONENTS.map(({ key, label, code }) => {
              const v1 = stats1[key];
              const v2 = stats2[key];
              const winner = catWinner(v1, v2);
              return (
                <div key={key}>
                  {/* Values row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 w-24">
                      <span
                        className={`text-lg md:text-xl font-black tabular-nums ${
                          winner === "left" ? "text-[#e10600]" : "text-[#0a0a0a]"
                        }`}
                      >
                        {Math.round(v1)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                        {code}
                      </span>
                      <p className="text-[9px] text-[#a3a3a3] hidden md:block">
                        {label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-24 justify-end">
                      <span
                        className={`text-lg md:text-xl font-black tabular-nums ${
                          winner === "right" ? "text-[#e10600]" : "text-[#0a0a0a]"
                        }`}
                      >
                        {Math.round(v2)}
                      </span>
                    </div>
                  </div>
                  {/* Mirrored bars */}
                  <div className="flex gap-0.5 h-[6px]">
                    {/* Left bar — grows from center to left */}
                    <div className="flex-1 flex justify-end">
                      <div className="w-full h-full rounded-l-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute right-0 top-0 h-full rounded-l-sm transition-all duration-700 ${
                            winner === "left" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                          }`}
                          style={{ width: `${v1}%` }}
                        />
                      </div>
                    </div>
                    {/* Right bar — grows from center to right */}
                    <div className="flex-1">
                      <div className="w-full h-full rounded-r-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-r-sm transition-all duration-700 ${
                            winner === "right" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                          }`}
                          style={{ width: `${v2}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GitHub Stats — Mirrored Bars */}
        <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
          <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
              GitHub
            </span>
          </div>
          <div className="p-5 space-y-5">
            {[
              {
                label: "Stars",
                code: "STR",
                v1: gh1.total_stars ?? 0,
                v2: gh2.total_stars ?? 0,
              },
              {
                label: "Repositories",
                code: "REP",
                v1: gh1.total_repos ?? 0,
                v2: gh2.total_repos ?? 0,
              },
              {
                label: "Followers",
                code: "FLW",
                v1: gh1.followers ?? 0,
                v2: gh2.followers ?? 0,
              },
            ].map(({ label, code, v1, v2 }) => {
              const winner = catWinner(v1, v2);
              const maxVal = Math.max(v1, v2, 1);
              return (
                <div key={label}>
                  {/* Values row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-24">
                      <span
                        className={`text-lg md:text-xl font-black tabular-nums ${
                          winner === "left" ? "text-[#e10600]" : "text-[#0a0a0a]"
                        }`}
                      >
                        {v1.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                        {code}
                      </span>
                      <p className="text-[9px] text-[#a3a3a3] hidden md:block">
                        {label}
                      </p>
                    </div>
                    <div className="w-24 text-right">
                      <span
                        className={`text-lg md:text-xl font-black tabular-nums ${
                          winner === "right" ? "text-[#e10600]" : "text-[#0a0a0a]"
                        }`}
                      >
                        {v2.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* Mirrored bars */}
                  <div className="flex gap-0.5 h-[6px]">
                    <div className="flex-1 flex justify-end">
                      <div className="w-full h-full rounded-l-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute right-0 top-0 h-full rounded-l-sm transition-all duration-700 ${
                            winner === "left" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                          }`}
                          style={{ width: `${(v1 / maxVal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-full rounded-r-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-r-sm transition-all duration-700 ${
                            winner === "right" ? "bg-[#e10600]" : "bg-[#0a0a0a]"
                          }`}
                          style={{ width: `${(v2 / maxVal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
