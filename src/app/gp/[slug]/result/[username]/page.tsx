import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGPBySlug } from "@/lib/f1/calendar";
import { ShareButton } from "@/components/share-button";

interface RaceEvent {
  lap?: number;
  type?: string;
  description?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; username: string }>;
}) {
  const { slug, username } = await params;
  const gp = getGPBySlug(slug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gitrace.dev";

  const title = gp
    ? `${username} - ${gp.name} Result | GitRace`
    : `${username} - Race Result | GitRace`;

  return {
    title,
    openGraph: {
      title: `${username}'s ${gp?.name ?? "Race"} Result`,
      description: `See how ${username} performed in the ${gp?.name ?? "Grand Prix"} on GitRace.`,
      images: [`${appUrl}/gp/${slug}/result/${username}/og`],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${username}'s ${gp?.name ?? "Race"} Result`,
      description: `See how ${username} performed in the ${gp?.name ?? "Grand Prix"} on GitRace.`,
      images: [`${appUrl}/gp/${slug}/result/${username}/og`],
    },
  };
}

export default async function GPResultPage({
  params,
}: {
  params: Promise<{ slug: string; username: string }>;
}) {
  const { slug, username } = await params;
  const gp = getGPBySlug(slug);

  if (!gp) notFound();

  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, github_username, avatar_url, car_color, car_number")
    .eq("github_username", username)
    .single();

  if (!profile) notFound();

  // Get GP record
  const { data: gpRecord } = await supabase
    .from("grand_prix")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!gpRecord) notFound();

  // Get race result
  const { data: raceResult } = await supabase
    .from("race_results")
    .select("*")
    .eq("gp_id", gpRecord.id)
    .eq("profile_id", profile.id)
    .eq("is_sprint", false)
    .single();

  // Get qualifying result
  const { data: qualiResult } = await supabase
    .from("qualifying_results")
    .select("final_position, eliminated_in")
    .eq("gp_id", gpRecord.id)
    .eq("profile_id", profile.id)
    .single();

  const position = raceResult?.final_position ?? null;
  const gridPosition = raceResult?.grid_position ?? null;
  const points = raceResult?.points_earned ?? 0;
  const fastestLap = raceResult?.fastest_lap ?? false;
  const dnf = raceResult?.dnf ?? false;
  const dnfReason = raceResult?.dnf_reason ?? null;
  const gapToLeader = raceResult?.gap_to_leader ?? 0;
  const eventsLog = (raceResult?.events_log ?? []) as RaceEvent[];

  const positionChange =
    gridPosition != null && position != null ? gridPosition - position : 0;

  const accentColor = gp.themeColors.primary;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gitrace.dev";
  const shareUrl = `${appUrl}/gp/${slug}/result/${username}`;

  const twitterText = dnf
    ? `DNF at the ${gp.name} on GitRace. Not every race goes to plan.`
    : position != null
      ? `P${position} at the ${gp.name} on GitRace!${points > 0 ? ` +${points} points.` : ""}${positionChange > 0 ? ` Gained ${positionChange} places from the grid.` : ""}`
      : `Check out my ${gp.name} result on GitRace!`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}, transparent 70%)`,
          }}
        />

        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: GP info + driver */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: accentColor }}
              >
                Race Result
              </p>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
                {gp.name}
              </h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-wider">
                {gp.circuit}
              </p>

              {/* Driver info */}
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={
                    profile.avatar_url ||
                    `https://github.com/${profile.github_username}.png`
                  }
                  alt={profile.github_username}
                  className="w-12 h-12 rounded-full"
                  style={{ border: `2px solid ${accentColor}` }}
                />
                <div>
                  <p className="text-white font-bold text-lg">
                    {profile.github_username}
                  </p>
                  <p className="text-white/40 text-sm font-mono">
                    #{profile.car_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Big position */}
            <div className="text-right">
              {dnf ? (
                <p className="text-6xl md:text-8xl font-black text-red-500 leading-none">
                  DNF
                </p>
              ) : position != null ? (
                <p className="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter">
                  P{position}
                </p>
              ) : (
                <p className="text-4xl font-bold text-white/30 leading-none">
                  No Result
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#e5e5e5] rounded-sm overflow-hidden">
          {/* Grid position */}
          <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#e5e5e5]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-1">
              Grid
            </p>
            <p className="text-2xl font-black text-[#0a0a0a] tabular-nums">
              {gridPosition != null ? `P${gridPosition}` : "--"}
            </p>
          </div>

          {/* Finish position */}
          <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#e5e5e5]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-1">
              Finish
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#0a0a0a] tabular-nums">
                {dnf ? "DNF" : position != null ? `P${position}` : "--"}
              </p>
              {!dnf && positionChange !== 0 && (
                <span
                  className={`text-sm font-bold ${positionChange > 0 ? "position-up" : "position-down"}`}
                >
                  {positionChange > 0
                    ? `+${positionChange}`
                    : positionChange}
                </span>
              )}
            </div>
          </div>

          {/* Points */}
          <div className="p-5 border-r border-[#e5e5e5]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-1">
              Points
            </p>
            <p className="text-2xl font-black tabular-nums" style={{ color: points > 0 ? accentColor : "#0a0a0a" }}>
              +{points}
            </p>
          </div>

          {/* Special */}
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-1">
              {fastestLap ? "Fastest Lap" : dnf ? "DNF Reason" : "Gap to P1"}
            </p>
            <p
              className={`text-2xl font-black tabular-nums ${fastestLap ? "fastest-lap" : ""}`}
            >
              {fastestLap
                ? "FL"
                : dnf
                  ? dnfReason ?? "Retired"
                  : gapToLeader > 0
                    ? `+${gapToLeader.toFixed(1)}s`
                    : position === 1
                      ? "Leader"
                      : "--"}
            </p>
          </div>
        </div>

        {/* Qualifying info */}
        {qualiResult && (
          <div className="mt-6 p-4 border border-[#e5e5e5] rounded-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-2">
              Qualifying
            </p>
            <div className="flex items-baseline gap-4">
              <span className="text-lg font-bold text-[#0a0a0a]">
                P{qualiResult.final_position}
              </span>
              {qualiResult.eliminated_in && (
                <span className="text-sm text-[#a3a3a3]">
                  Eliminated in {qualiResult.eliminated_in.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Events log */}
        {eventsLog.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-3">
              Key Events
            </p>
            <div className="space-y-2">
              {eventsLog
                .filter(
                  (e: RaceEvent) =>
                    e.type === "overtake" ||
                    e.type === "pit_stop" ||
                    e.type === "dnf" ||
                    e.type === "fastest_lap" ||
                    e.type === "safety_car" ||
                    e.type === "position_change"
                )
                .slice(0, 8)
                .map((event: RaceEvent, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span className="text-xs font-mono text-[#a3a3a3] w-12">
                      Lap {event.lap ?? "?"}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#525252] w-24">
                      {event.type?.replace("_", " ")}
                    </span>
                    <span className="text-sm text-[#0a0a0a]">
                      {event.description ?? ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex flex-wrap gap-3">
          <ShareButton
            url={shareUrl}
            twitterText={twitterText}
            accentColor={accentColor}
          />
          <Link
            href={`/driver/${username}`}
            className="f1-btn f1-btn-secondary rounded-sm text-sm"
          >
            View Driver Profile
          </Link>
          <Link
            href="/leaderboard"
            className="f1-btn f1-btn-secondary rounded-sm text-sm"
          >
            Full Standings
          </Link>
        </div>
      </section>
    </div>
  );
}
