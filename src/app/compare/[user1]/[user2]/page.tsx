import { createClient } from "@/lib/supabase/server";
import { calculateOverallRating } from "@/lib/race/car-components";
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

const STAT_COMPONENTS: { key: keyof CarStats; label: string }[] = [
  { key: "power_unit", label: "Power Unit" },
  { key: "aero", label: "Aerodynamics" },
  { key: "reliability", label: "Reliability" },
  { key: "tire_mgmt", label: "Tire Mgmt" },
  { key: "strategy", label: "Strategy" },
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

function WinnerArrow({ side }: { side: "left" | "right" | "tie" }) {
  if (side === "tie") return null;
  return (
    <span className="text-[#e10600] text-xs font-black">
      {side === "left" ? "\u25C0" : "\u25B6"}
    </span>
  );
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/leaderboard"
          className="text-[#a3a3a3] text-sm hover:text-[#525252] transition-colors"
        >
          &larr; Back to Leaderboard
        </Link>

        {/* Title */}
        <h1 className="f1-heading text-2xl mt-4 mb-8 text-center">
          HEAD TO HEAD
        </h1>

        {/* Driver Headers */}
        <div className="flex items-center justify-between mb-8">
          {/* Left driver */}
          <Link
            href={`/driver/${p1.github_username}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={p1.avatar_url || ""}
              alt={p1.github_username}
              className="w-16 h-16 rounded-full border-2 border-[#e5e5e5] group-hover:border-[#0a0a0a] transition-colors"
            />
            <div>
              <p className="font-bold text-[#0a0a0a] text-lg">
                {p1.github_username}
              </p>
              <p className="text-[#a3a3a3] text-xs font-mono">
                #{p1.car_number || 0}
              </p>
            </div>
          </Link>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-[#a3a3a3] text-xs uppercase tracking-widest">
              vs
            </span>
          </div>

          {/* Right driver */}
          <Link
            href={`/driver/${p2.github_username}`}
            className="flex items-center gap-3 group flex-row-reverse"
          >
            <img
              src={p2.avatar_url || ""}
              alt={p2.github_username}
              className="w-16 h-16 rounded-full border-2 border-[#e5e5e5] group-hover:border-[#0a0a0a] transition-colors"
            />
            <div className="text-right">
              <p className="font-bold text-[#0a0a0a] text-lg">
                {p2.github_username}
              </p>
              <p className="text-[#a3a3a3] text-xs font-mono">
                #{p2.car_number || 0}
              </p>
            </div>
          </Link>
        </div>

        {/* Overall Rating */}
        <div className="rounded-sm border border-[#e5e5e5] p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a3a3a3] text-xs uppercase tracking-wider">
              Overall Rating
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-3xl font-black ${overall1 >= overall2 ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
            >
              {Math.round(overall1)}
            </span>
            <WinnerArrow side={catWinner(overall1, overall2)} />
            <span
              className={`text-3xl font-black ${overall2 >= overall1 ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
            >
              {Math.round(overall2)}
            </span>
          </div>
        </div>

        {/* Total Points */}
        <div className="rounded-sm border border-[#e5e5e5] p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a3a3a3] text-xs uppercase tracking-wider">
              Championship Points
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-3xl font-black ${points1 >= points2 ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
            >
              {points1}
            </span>
            <WinnerArrow side={catWinner(points1, points2)} />
            <span
              className={`text-3xl font-black ${points2 >= points1 ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
            >
              {points2}
            </span>
          </div>
        </div>

        {/* Car Stats - Mirrored Bars */}
        <div className="rounded-sm border border-[#e5e5e5] p-6 mb-4">
          <h3 className="text-[#a3a3a3] text-xs uppercase tracking-wider mb-5">
            Car Development
          </h3>
          <div className="space-y-5">
            {STAT_COMPONENTS.map(({ key, label }) => {
              const v1 = stats1[key];
              const v2 = stats2[key];
              const winner = catWinner(v1, v2);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-sm font-bold w-10 text-left ${winner === "left" ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
                    >
                      {Math.round(v1)}
                    </span>
                    <span className="text-[#525252] text-xs">{label}</span>
                    <span
                      className={`text-sm font-bold w-10 text-right ${winner === "right" ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
                    >
                      {Math.round(v2)}
                    </span>
                  </div>
                  <div className="flex gap-1 h-[6px]">
                    {/* Left bar - grows from right to left */}
                    <div className="flex-1 flex justify-end">
                      <div className="w-full h-full rounded-l-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute right-0 top-0 h-full rounded-l-sm transition-all duration-600 ${winner === "left" ? "bg-[#e10600]" : "bg-[#0a0a0a]"}`}
                          style={{ width: `${v1}%` }}
                        />
                      </div>
                    </div>
                    {/* Right bar - grows from left to right */}
                    <div className="flex-1">
                      <div className="w-full h-full rounded-r-sm bg-[#f0f0f0] relative overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-r-sm transition-all duration-600 ${winner === "right" ? "bg-[#e10600]" : "bg-[#0a0a0a]"}`}
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

        {/* GitHub Stats */}
        <div className="rounded-sm border border-[#e5e5e5] p-6 mb-4">
          <h3 className="text-[#a3a3a3] text-xs uppercase tracking-wider mb-5">
            GitHub Stats
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Stars",
                v1: gh1.total_stars ?? 0,
                v2: gh2.total_stars ?? 0,
              },
              {
                label: "Repositories",
                v1: gh1.total_repos ?? 0,
                v2: gh2.total_repos ?? 0,
              },
              {
                label: "Followers",
                v1: gh1.followers ?? 0,
                v2: gh2.followers ?? 0,
              },
            ].map(({ label, v1, v2 }) => {
              const winner = catWinner(v1, v2);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0"
                >
                  <span
                    className={`text-sm font-bold ${winner === "left" ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
                  >
                    {v1.toLocaleString()}
                  </span>
                  <span className="text-[#525252] text-xs">{label}</span>
                  <span
                    className={`text-sm font-bold ${winner === "right" ? "text-[#e10600]" : "text-[#0a0a0a]"}`}
                  >
                    {v2.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Winner Banner */}
        <div className="rounded-sm border-2 border-[#e10600] p-6 text-center">
          <p className="text-[#a3a3a3] text-xs uppercase tracking-wider mb-2">
            Verdict
          </p>
          {overallWinner === "tie" ? (
            <p className="font-black text-xl text-[#0a0a0a]">DEAD HEAT</p>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <img
                src={
                  (overallWinner === "left" ? p1.avatar_url : p2.avatar_url) ||
                  ""
                }
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <p className="font-black text-xl text-[#e10600]">
                {overallWinner === "left"
                  ? p1.github_username
                  : p2.github_username}{" "}
                WINS
              </p>
            </div>
          )}
          <p className="text-[#a3a3a3] text-xs mt-2">
            {winsLeft} - {winsRight} across all categories
          </p>
        </div>
      </div>
    </div>
  );
}
