import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus, getNow } from "@/lib/f1/calendar";
import { createClient } from "@/lib/supabase/server";
import { runQualifying, type QualifyingDriver } from "@/lib/race/qualifying";
import { fillGridWithBots } from "@/lib/race/matchmaking";
import { CountdownTimer } from "@/components/countdown-timer";
import { loadSnapshot } from "@/lib/race/snapshots";
import { getTrackImage } from "@/lib/f1/track-layouts";

export const dynamic = "force-dynamic";

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "\u{1F1E6}\u{1F1FA}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  BH: "\u{1F1E7}\u{1F1ED}", SA: "\u{1F1F8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}", MC: "\u{1F1F2}\u{1F1E8}", ES: "\u{1F1EA}\u{1F1F8}",
  CA: "\u{1F1E8}\u{1F1E6}", AT: "\u{1F1E6}\u{1F1F9}", GB: "\u{1F1EC}\u{1F1E7}",
  BE: "\u{1F1E7}\u{1F1EA}", HU: "\u{1F1ED}\u{1F1FA}", NL: "\u{1F1F3}\u{1F1F1}",
  AZ: "\u{1F1E6}\u{1F1FF}", SG: "\u{1F1F8}\u{1F1EC}", MX: "\u{1F1F2}\u{1F1FD}",
  BR: "\u{1F1E7}\u{1F1F7}", QA: "\u{1F1F6}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
};

export default async function QualifyingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = getNow();
  const status = getGPStatus(gp, now);
  const supabase = await createClient();
  const flag = COUNTRY_FLAGS[gp.countryCode] ?? "";
  const trackImage = getTrackImage(gp.slug);

  // Generate qualifying results from current car stats
  let qualiResults: Array<{
    position: number;
    name: string;
    isBot: boolean;
    avatarUrl: string;
    q1Time: number;
    q2Time: number | null;
    q3Time: number | null;
    eliminatedIn: string | null;
  }> = [];

  // First, try to load persisted snapshot from DB
  const snapshot = await loadSnapshot(slug);
  if (snapshot?.qualifying_data && Array.isArray(snapshot.qualifying_data)) {
    qualiResults = snapshot.qualifying_data;
  } else {
    // Fallback: simulate on-the-fly
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, github_username, avatar_url, car_stats")
      .not("car_stats", "is", null)
      .order("total_points", { ascending: false });

    if (profiles && profiles.length > 0) {
      const realDrivers = profiles.map((p) => ({ profileId: p.id }));
      const grid = fillGridWithBots(realDrivers, 1, slug);

      const qualDrivers: QualifyingDriver[] = grid.map((slot) => {
        if (slot.isBot) {
          return { profileId: slot.botName ?? "bot", name: slot.botName ?? "Bot", carStats: slot.botStats!, isBot: true };
        }
        const p = profiles.find((pr) => pr.id === slot.profileId);
        return {
          profileId: slot.profileId!,
          name: p?.github_username ?? "Unknown",
          carStats: p?.car_stats ?? { power_unit: 30, aero: 30, reliability: 30, tire_mgmt: 30, strategy: 30 },
          isBot: false,
        };
      });

      const results = runQualifying(qualDrivers, `${slug}-quali`);
      qualiResults = results.map((r) => {
        const p = profiles.find((pr) => pr.github_username === r.name || pr.id === r.profileId);
        return {
          position: r.finalPosition,
          name: r.name,
          isBot: r.isBot,
          avatarUrl: p?.avatar_url ?? "",
          q1Time: r.q1Time,
          q2Time: r.q2Time,
          q3Time: r.q3Time,
          eliminatedIn: r.eliminatedIn,
        };
      });
    }
  }

  const qualiStart = new Date(gp.dates.qualiStart);
  const qualiEnd = new Date(gp.dates.qualiEnd);
  const elapsed = (now.getTime() - qualiStart.getTime()) / (qualiEnd.getTime() - qualiStart.getTime());
  const phase = elapsed < 0.33 ? "Q1" : elapsed < 0.66 ? "Q2" : "Q3";

  const hasResults = qualiResults.length > 0;
  const isLive = status === "qualifying";

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Dark Hero ─── */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        {/* Country color accent gradient */}
        <div
          className="absolute top-0 right-0 w-[600px] h-full pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${gp.themeColors.primary}15 50%, ${gp.themeColors.primary}08 100%)`,
          }}
        />

        {/* Track layout watermark */}
        {trackImage && (
          <img
            src={trackImage}
            alt=""
            className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block w-[280px] h-[280px] object-contain invert opacity-[0.06]"
          />
        )}

        {/* Top accent bar */}
        <div className="h-1" style={{ background: gp.themeColors.primary }} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Left: GP info */}
            <div className="flex-1 min-w-0">
              {/* Status + round */}
              <div className="flex items-center gap-3 mb-5">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#e10600] text-white rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Qualifying Live
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    Qualifying
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                  R{String(gp.round).padStart(2, "0")}
                </span>
              </div>

              {/* GP name */}
              <div className="flex items-start gap-4 mb-3">
                <span className="text-4xl mt-1 hidden sm:block">{flag}</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
                    {gp.name.replace(" Grand Prix", "")}
                  </h1>
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/30 mt-1">
                    Grand Prix &mdash; Qualifying
                  </p>
                </div>
              </div>

              {/* Circuit */}
              <p className="text-white/50 text-sm mb-6">{gp.circuit}</p>

              {/* Q1 / Q2 / Q3 phase indicators */}
              {(isLive || hasResults) && (
                <div className="flex items-center gap-2">
                  {(["Q1", "Q2", "Q3"] as const).map((q) => {
                    const isActive = isLive && phase === q;
                    const isPast = isLive
                      ? (q === "Q1" && (phase === "Q2" || phase === "Q3")) || (q === "Q2" && phase === "Q3")
                      : true;

                    return (
                      <div
                        key={q}
                        className={`
                          relative px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors
                          ${isActive
                            ? "bg-[#e10600] text-white"
                            : isPast
                              ? "bg-white/10 text-white/60"
                              : "bg-white/[0.04] text-white/20"
                          }
                        `}
                      >
                        {isActive && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        <span className={isActive ? "ml-2" : ""}>{q}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Countdown panel */}
            <div className="shrink-0 w-full md:w-auto">
              <div className="bg-white/[0.05] border border-white/10 rounded-sm p-5 md:p-6 backdrop-blur-sm md:min-w-[260px]">
                {status === "upcoming" && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                      Qualifying Opens In
                    </p>
                    <CountdownTimer targetDate={gp.dates.qualiStart} variant="dark" />
                  </>
                )}

                {isLive && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                      Session Ends In
                    </p>
                    <CountdownTimer targetDate={gp.dates.qualiEnd} liveLabel="Grid Locked" variant="dark" />
                  </>
                )}

                {(status === "finished" || status === "race_day" || status === "sprint") && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                      Qualifying Complete
                    </p>
                    <p className="text-xl font-bold text-white/60">Grid Set</p>
                  </>
                )}

                {/* Mini schedule */}
                <div className="border-t border-white/10 pt-3 mt-4 space-y-2">
                  <MiniScheduleRow
                    label="Qualifying"
                    date={gp.dates.qualiStart}
                    active={isLive}
                    done={status === "race_day" || status === "sprint" || status === "finished"}
                  />
                  <MiniScheduleRow
                    label="Grand Prix"
                    date={gp.dates.raceDate}
                    active={status === "race_day"}
                    done={status === "finished"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Qualifying Grid Table (white section) ─── */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Upcoming: no grid yet, just the hero countdown */}
        {status === "upcoming" && !hasResults && (
          <div className="text-center py-16">
            <p className="text-[#a3a3a3] text-sm uppercase tracking-wider font-semibold">
              Qualifying grid will appear once the session begins
            </p>
          </div>
        )}

        {/* Grid table */}
        {hasResults && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold uppercase tracking-tight text-[#0a0a0a]">
                Starting Grid
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                {qualiResults.length} Drivers
              </span>
            </div>

            <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3]">
                    <th className="text-left py-3 px-4 w-16 font-semibold">Pos</th>
                    <th className="text-left py-3 px-4 font-semibold">Driver</th>
                    <th className="text-right py-3 px-4 w-24 font-semibold">Q1</th>
                    <th className="text-right py-3 px-4 w-24 font-semibold hidden sm:table-cell">Q2</th>
                    <th className="text-right py-3 px-4 w-24 font-semibold hidden sm:table-cell">Q3</th>
                  </tr>
                </thead>
                <tbody>
                  {qualiResults.map((r) => {
                    // Zone styling: Q3 (P1-10) = normal, Q2 elim (P11-15) = slightly dimmed, Q1 elim (P16-20) = more dimmed
                    const isQ3Zone = r.position <= 10;
                    const isQ2Zone = r.position > 10 && r.position <= 15;
                    const isQ1Zone = r.position > 15;

                    const rowBg = isQ1Zone
                      ? "bg-[#f5f5f5]"
                      : isQ2Zone
                        ? "bg-[#fafafa]"
                        : "";

                    const textOpacity = isQ1Zone
                      ? "opacity-50"
                      : isQ2Zone
                        ? "opacity-70"
                        : "";

                    // Accent stripe color based on zone
                    const stripeColor = isQ3Zone
                      ? gp.themeColors.primary
                      : isQ2Zone
                        ? "#a3a3a3"
                        : "#d4d4d4";

                    return (
                      <tr
                        key={`${r.name}-${r.position}`}
                        className={`border-b border-[#f0f0f0] last:border-0 ${rowBg} ${textOpacity}`}
                      >
                        {/* Position with accent stripe */}
                        <td className="py-3 px-0">
                          <div className="flex items-center gap-0">
                            <div
                              className="w-1 self-stretch min-h-[36px] rounded-r-sm shrink-0"
                              style={{ background: stripeColor }}
                            />
                            <span className="font-black text-sm tabular-nums pl-3 text-[#0a0a0a]">
                              {String(r.position).padStart(2, "0")}
                            </span>
                          </div>
                        </td>

                        {/* Driver */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {r.avatarUrl ? (
                              <img
                                src={r.avatarUrl}
                                alt=""
                                className="w-7 h-7 rounded-full border border-[#e5e5e5]"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#e5e5e5] flex items-center justify-center text-[9px] font-bold text-[#a3a3a3]">
                                {r.isBot ? "B" : "?"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className={`text-sm font-bold block truncate ${r.isBot ? "text-[#a3a3a3]" : "text-[#0a0a0a]"}`}>
                                {r.name}
                              </span>
                              {r.eliminatedIn && (
                                <span className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider">
                                  Out in {r.eliminatedIn}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Lap times — monospace */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-xs text-[#525252] tabular-nums">
                            {r.q1Time.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <span className="font-mono text-xs text-[#525252] tabular-nums">
                            {r.q2Time ? r.q2Time.toFixed(3) : "\u2014"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <span className="font-mono text-xs text-[#525252] tabular-nums">
                            {r.q3Time ? r.q3Time.toFixed(3) : "\u2014"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Zone legend */}
            <div className="flex flex-wrap items-center gap-5 mt-4 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: gp.themeColors.primary }} />
                <span>P1-10 Q3 Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#a3a3a3]" />
                <span>P11-15 Eliminated Q2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#d4d4d4]" />
                <span>P16-20 Eliminated Q1</span>
              </div>
            </div>
          </>
        )}

        {/* No drivers state */}
        {!hasResults && status !== "upcoming" && (
          <div className="text-center py-12 rounded-sm border border-[#e5e5e5]">
            <p className="text-[#a3a3a3] text-sm">No drivers synced yet. Sign in and sync your GitHub to join.</p>
          </div>
        )}

        {/* Navigation links */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href={`/gp/${slug}/race`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm bg-[#0a0a0a] text-white hover:bg-[#262626] transition-colors"
          >
            Race Results
          </Link>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm border border-[#e5e5e5] text-[#a3a3a3] hover:text-[#0a0a0a] hover:border-[#d4d4d4] transition-colors"
          >
            Calendar
          </Link>
        </div>
      </section>
    </div>
  );
}

function MiniScheduleRow({ label, date, active, done }: { label: string; date: string; active: boolean; done: boolean }) {
  const d = new Date(date);
  const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-1 h-1 rounded-full shrink-0 ${active ? "bg-[#e10600] animate-pulse" : done ? "bg-white/40" : "bg-white/15"}`} />
      <span className={`font-semibold ${active ? "text-white" : done ? "text-white/30 line-through" : "text-white/50"}`}>{label}</span>
      <span className="text-white/20 ml-auto font-mono">{dayStr}</span>
    </div>
  );
}
