import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus, getNow } from "@/lib/f1/calendar";
import { createClient } from "@/lib/supabase/server";
import { runQualifying, type QualifyingDriver } from "@/lib/race/qualifying";
import { simulateRace, type RaceDriver, type RaceConfig } from "@/lib/race/simulation";
import { fillGridWithBots } from "@/lib/race/matchmaking";
import { CountdownTimer } from "@/components/countdown-timer";

export const dynamic = "force-dynamic";

export default async function RaceResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = getNow();
  const status = getGPStatus(gp, now);
  const supabase = await createClient();

  // Get profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, github_username, avatar_url, car_stats")
    .not("car_stats", "is", null)
    .order("total_points", { ascending: false });

  // Simulate qualifying + race
  let raceResults: Array<{
    position: number;
    name: string;
    isBot: boolean;
    avatarUrl: string;
    gridPosition: number;
    points: number;
    fastestLap: boolean;
    dnf: boolean;
    dnfReason: string | null;
    gap: number;
  }> = [];

  let events: Array<{ lap: number; type: string; description: string }> = [];
  let hadRain = false;
  let safetyCars = 0;

  if (profiles && profiles.length > 0 && (status === "race_day" || status === "sprint" || status === "finished")) {
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

    const qualiResults = runQualifying(qualDrivers, `${slug}-quali`);

    const raceDrivers: RaceDriver[] = qualiResults.map((q) => {
      const qd = qualDrivers.find((d) => d.profileId === q.profileId)!;
      return { profileId: q.profileId, name: q.name, carStats: qd.carStats, gridPosition: q.finalPosition, isBot: q.isBot };
    });

    const config: RaceConfig = { totalLaps: 57, isSprint: false, seed: `${slug}-race`, weatherChance: 0.3 };
    const sim = simulateRace(raceDrivers, config);

    raceResults = sim.results.map((r) => {
      const p = profiles.find((pr) => pr.github_username === r.name || pr.id === r.profileId);
      return {
        position: r.finalPosition,
        name: r.name,
        isBot: r.isBot,
        avatarUrl: p?.avatar_url ?? "",
        gridPosition: r.gridPosition,
        points: r.points,
        fastestLap: r.fastestLap,
        dnf: r.dnf,
        dnfReason: r.dnfReason,
        gap: r.gapToLeader,
      };
    });

    events = sim.events;
    hadRain = sim.hadRain;
    safetyCars = sim.safetyCars;
  }

  const podium = raceResults.slice(0, 3);
  const hasResults = raceResults.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Round {gp.round} — Race</span>
          <h1 className="f1-heading text-2xl text-[#0a0a0a] mt-1">{gp.name}</h1>
          <p className="text-[#525252] text-sm">{gp.circuit}</p>
          {gp.hasSprint && <span className="f1-tag f1-tag-neutral mt-2">Sprint Weekend</span>}
        </div>

        {(status === "upcoming" || status === "qualifying") && (
          <div className="text-center p-12 rounded-sm border border-[#e5e5e5]">
            <p className="text-[#525252] mb-4">Race starts</p>
            <CountdownTimer targetDate={gp.dates.raceDate} />
            <Link href={`/gp/${slug}/qualifying`} className="inline-block mt-4 text-sm font-semibold text-[#e10600] hover:underline">
              View Qualifying
            </Link>
          </div>
        )}

        {hasResults && (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-6 mb-8 pt-4">
              {[
                { r: podium[1], pos: "P2", h: "h-24", order: 1 },
                { r: podium[0], pos: "P1", h: "h-32", order: 2 },
                { r: podium[2], pos: "P3", h: "h-16", order: 3 },
              ].map(({ r, pos, h, order }) => r && (
                <div key={pos} className="flex flex-col items-center" style={{ order }}>
                  {r.avatarUrl ? (
                    <img src={r.avatarUrl} alt="" className="w-12 h-12 rounded-full mb-1" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#e5e5e5] mb-1" />
                  )}
                  <span className={`text-sm font-bold ${r.isBot ? "text-[#a3a3a3]" : "text-[#0a0a0a]"}`}>{r.name}</span>
                  <span className="text-[#a3a3a3] text-xs">{r.points} pts</span>
                  <span className="text-xs font-bold text-[#a3a3a3] mt-1">{pos}</span>
                  <div className={`w-20 ${h} rounded-t-lg mt-1 ${pos === "P1" ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]"}`} />
                </div>
              ))}
            </div>

            {/* Race stats */}
            <div className="flex gap-4 mb-6">
              {[
                { label: "Laps", value: "57" },
                { label: "Safety Cars", value: String(safetyCars) },
                { label: "Weather", value: hadRain ? "Wet" : "Dry" },
                { label: "Events", value: String(events.length) },
              ].map((s) => (
                <div key={s.label} className="flex-1 text-center p-3 rounded-sm border border-[#e5e5e5]">
                  <p className="text-lg font-black text-[#0a0a0a]">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-sm border border-[#e5e5e5] p-5 mb-6">
              <h3 className="font-bold text-[#0a0a0a] mb-4 text-sm uppercase tracking-wider">Race Timeline</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {events.map((e, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-[#f5f5f5] text-[#525252] shrink-0 w-10 text-center">
                      L{e.lap}
                    </span>
                    <p className="text-[#525252] text-sm">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification */}
            <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3]">
                    <th className="text-left py-3 px-4 w-12 font-semibold">Pos</th>
                    <th className="text-left py-3 px-4 font-semibold">Driver</th>
                    <th className="text-right py-3 px-4 w-14 font-semibold hidden sm:table-cell">Grid</th>
                    <th className="text-right py-3 px-4 w-16 font-semibold hidden sm:table-cell">Gap</th>
                    <th className="text-right py-3 px-4 w-14 font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {raceResults.map((r) => {
                    const posChange = r.gridPosition - r.position;
                    return (
                      <tr key={`${r.name}-${r.position}`} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]">
                        <td className="py-2.5 px-4">
                          <span className={`font-black text-sm ${r.position <= 3 ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                            {r.dnf ? "DNF" : r.position}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {r.avatarUrl ? (
                              <img src={r.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[#e5e5e5]" />
                            )}
                            <span className={`text-sm font-semibold ${r.isBot ? "text-[#a3a3a3]" : "text-[#0a0a0a]"}`}>{r.name}</span>
                            {r.fastestLap && <span className="text-[10px] font-bold text-purple-600">FL</span>}
                            {posChange > 0 && <span className="text-[10px] font-bold text-green-600">+{posChange}</span>}
                            {posChange < 0 && <span className="text-[10px] font-bold text-red-600">{posChange}</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs text-[#a3a3a3] hidden sm:table-cell">P{r.gridPosition}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-xs text-[#a3a3a3] hidden sm:table-cell">
                          {r.position === 1 ? "Leader" : r.dnf ? r.dnfReason : `+${r.gap.toFixed(1)}s`}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-sm text-[#0a0a0a]">{r.points || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="text-center mt-8 flex gap-4 justify-center">
          <Link href={`/gp/${slug}/qualifying`} className="text-sm font-semibold text-[#e10600] hover:underline">Qualifying Grid</Link>
          <Link href="/calendar" className="text-[#a3a3a3] text-sm hover:text-[#0a0a0a]">Back to Calendar</Link>
        </div>
      </div>
    </div>
  );
}
