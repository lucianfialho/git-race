import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGPBySlug } from "@/lib/f1/calendar";
import { ShareResultLink } from "@/components/share-result-link";
import { RaceTabs } from "@/components/race/race-tabs";

interface RaceResultRow {
  id: string;
  grid_position: number;
  final_position: number | null;
  points_earned: number;
  fastest_lap: boolean;
  dnf: boolean;
  dnf_reason: string | null;
  gap_to_leader: number;
  is_bot: boolean;
  bot_name: string | null;
  profile_id: string | null;
  profiles: {
    github_username: string;
    avatar_url: string | null;
    car_color: string;
    car_number: number;
  } | null;
}

export default async function GPRacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const gp = getGPBySlug(slug);

  if (!gp) notFound();

  const isSprint = gp.hasSprint && tab === "sprint";

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentProfile: { id: string; github_username: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, github_username")
      .eq("id", user.id)
      .single();
    currentProfile = data;
  }

  // Get GP record
  const { data: gpRecord } = await supabase
    .from("grand_prix")
    .select("id, status")
    .eq("slug", slug)
    .single();

  if (!gpRecord) notFound();

  // Get race results filtered by sprint/race
  const { data: results } = await supabase
    .from("race_results")
    .select("*, profiles(github_username, avatar_url, car_color, car_number)")
    .eq("gp_id", gpRecord.id)
    .eq("is_sprint", isSprint)
    .order("final_position", { ascending: true, nullsFirst: false });

  const raceResults = (results ?? []) as unknown as RaceResultRow[];

  const accentColor = gp.themeColors.primary;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: accentColor }}
          >
            Round {gp.round}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
            {gp.name}
          </h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-wider">
            {gp.circuit}
          </p>

          {/* Share button for current user */}
          {currentProfile && (
            <div className="mt-6">
              <ShareResultLink
                slug={slug}
                username={currentProfile.github_username}
                accentColor={accentColor}
              />
            </div>
          )}
        </div>
      </section>

      {/* Results table */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Sprint/Race tabs for sprint weekends */}
        {gp.hasSprint && (
          <div className="mb-6">
            <RaceTabs slug={slug} accentColor={accentColor} />
          </div>
        )}

        {raceResults.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#a3a3a3] text-sm uppercase tracking-wider">
              No {isSprint ? "sprint" : "race"} results yet
            </p>
            <p className="text-[#525252] mt-2">
              Results will appear here after the {isSprint ? "sprint" : "race"} simulation.
            </p>
          </div>
        ) : (
          <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[48px_1fr_80px_80px_64px] sm:grid-cols-[48px_1fr_80px_80px_80px_64px] gap-0 px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5] text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3]">
              <span>Pos</span>
              <span>Driver</span>
              <span className="hidden sm:block">Grid</span>
              <span>Gap</span>
              <span>Pts</span>
              <span></span>
            </div>

            {/* Rows */}
            {raceResults.map((result) => {
              const driverName =
                result.profiles?.github_username ?? result.bot_name ?? "Unknown";
              const avatar =
                result.profiles?.avatar_url ??
                (result.is_bot
                  ? `https://api.dicebear.com/7.x/bottts/svg?seed=${result.bot_name}`
                  : null);
              const gridChange =
                result.grid_position != null && result.final_position != null
                  ? result.grid_position - result.final_position
                  : 0;
              const isCurrentUser =
                currentProfile && result.profile_id === currentProfile.id;

              return (
                <div
                  key={result.id}
                  className={`grid grid-cols-[48px_1fr_80px_80px_64px] sm:grid-cols-[48px_1fr_80px_80px_80px_64px] gap-0 px-4 py-3 border-b border-[#f0f0f0] last:border-0 items-center ${isCurrentUser ? "bg-[#fafafa]" : ""}`}
                >
                  {/* Position */}
                  <span className="text-lg font-black text-[#0a0a0a] tabular-nums">
                    {result.dnf
                      ? "DNF"
                      : result.final_position ?? "--"}
                  </span>

                  {/* Driver */}
                  <div className="flex items-center gap-2 min-w-0">
                    {avatar && (
                      <img
                        src={avatar}
                        alt=""
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0a0a0a] truncate">
                        {driverName}
                      </p>
                      {result.fastest_lap && (
                        <span className="text-[10px] font-bold uppercase tracking-wider fastest-lap">
                          Fastest Lap
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid */}
                  <span className="hidden sm:flex items-center gap-1 text-sm text-[#525252] tabular-nums">
                    P{result.grid_position}
                    {gridChange !== 0 && (
                      <span
                        className={`text-xs font-bold ${gridChange > 0 ? "position-up" : "position-down"}`}
                      >
                        {gridChange > 0 ? `+${gridChange}` : gridChange}
                      </span>
                    )}
                  </span>

                  {/* Gap */}
                  <span className="text-sm text-[#525252] tabular-nums">
                    {result.dnf
                      ? result.dnf_reason ?? "Retired"
                      : result.final_position === 1
                        ? "Leader"
                        : result.gap_to_leader > 0
                          ? `+${result.gap_to_leader.toFixed(1)}s`
                          : "--"}
                  </span>

                  {/* Points */}
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{
                      color:
                        result.points_earned > 0 ? accentColor : "#a3a3a3",
                    }}
                  >
                    {result.points_earned > 0
                      ? `+${result.points_earned}`
                      : "0"}
                  </span>

                  {/* Link to result page */}
                  <span className="text-right">
                    {result.profiles?.github_username && (
                      <Link
                        href={`/gp/${slug}/result/${result.profiles.github_username}`}
                        className="text-xs text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
                      >
                        View
                      </Link>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Link
            href="/leaderboard"
            className="f1-btn f1-btn-secondary rounded-sm text-sm"
          >
            Championship Standings
          </Link>
          <Link
            href="/calendar"
            className="f1-btn f1-btn-secondary rounded-sm text-sm"
          >
            Calendar
          </Link>
        </div>
      </section>
    </div>
  );
}
