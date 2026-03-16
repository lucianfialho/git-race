import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus, getNow } from "@/lib/f1/calendar";
import { createClient } from "@/lib/supabase/server";
import { runQualifying, type QualifyingDriver } from "@/lib/race/qualifying";
import { fillGridWithBots } from "@/lib/race/matchmaking";
import { CountdownTimer } from "@/components/countdown-timer";
import { loadSnapshot } from "@/lib/race/snapshots";

export const dynamic = "force-dynamic";

export default async function QualifyingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = getNow();
  const status = getGPStatus(gp, now);
  const supabase = await createClient();

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Round {gp.round} — Qualifying</span>
          <h1 className="f1-heading text-2xl text-[#0a0a0a] mt-1">{gp.name}</h1>
          <p className="text-[#525252] text-sm">{gp.circuit}</p>
        </div>

        {status === "upcoming" && (
          <div className="text-center p-12 rounded-sm border border-[#e5e5e5]">
            <p className="text-[#525252] mb-4">Qualifying starts</p>
            <CountdownTimer targetDate={gp.dates.qualiStart} />
          </div>
        )}

        {status === "qualifying" && (
          <div className="flex gap-2 mb-6">
            {["Q1", "Q2", "Q3"].map((q) => (
              <div key={q} className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider ${phase === q ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-[#a3a3a3]"}`}>
                {q}
              </div>
            ))}
            <div className="ml-auto">
              <CountdownTimer targetDate={gp.dates.qualiEnd} liveLabel="Grid Locked" />
            </div>
          </div>
        )}

        {/* Qualifying Grid */}
        {qualiResults.length > 0 && (
          <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[10px] uppercase tracking-[0.15em] text-[#a3a3a3]">
                  <th className="text-left py-3 px-4 w-12 font-semibold">Pos</th>
                  <th className="text-left py-3 px-4 font-semibold">Driver</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold">Q1</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold hidden sm:table-cell">Q2</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold hidden sm:table-cell">Q3</th>
                </tr>
              </thead>
              <tbody>
                {qualiResults.map((r) => {
                  const zoneColor =
                    r.position <= 10 ? "" :
                    r.position <= 15 ? "bg-[#fafafa]" :
                    "bg-[#f5f5f5]";

                  return (
                    <tr key={`${r.name}-${r.position}`} className={`border-b border-[#f5f5f5] last:border-0 ${zoneColor}`}>
                      <td className="py-2.5 px-4">
                        <span className={`font-black text-sm ${r.position <= 3 ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                          {r.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {r.avatarUrl ? (
                            <img src={r.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#e5e5e5] flex items-center justify-center text-[8px] font-bold text-[#a3a3a3]">
                              {r.isBot ? "B" : "?"}
                            </div>
                          )}
                          <span className={`text-sm font-semibold ${r.isBot ? "text-[#a3a3a3]" : "text-[#0a0a0a]"}`}>
                            {r.name}
                          </span>
                          {r.eliminatedIn && (
                            <span className="text-[10px] font-bold text-[#a3a3a3] uppercase">Out in {r.eliminatedIn}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-[#525252]">{r.q1Time.toFixed(3)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-[#525252] hidden sm:table-cell">
                        {r.q2Time ? r.q2Time.toFixed(3) : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-[#525252] hidden sm:table-cell">
                        {r.q3Time ? r.q3Time.toFixed(3) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Zone legend */}
        {qualiResults.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white border border-[#e5e5e5]" /> P1–10 Advanced to Q3</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#fafafa] border border-[#e5e5e5]" /> P11–15 Out in Q2</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f5f5f5] border border-[#e5e5e5]" /> P16–20 Out in Q1</div>
          </div>
        )}

        {qualiResults.length === 0 && (status === "qualifying" || status === "finished" || status === "race_day") && (
          <div className="text-center p-8 rounded-sm border border-[#e5e5e5]">
            <p className="text-[#a3a3a3]">No drivers synced yet. Sign in and sync your GitHub to join.</p>
          </div>
        )}

        <div className="text-center mt-8 flex gap-4 justify-center">
          <Link href={`/gp/${slug}/race`} className="text-sm font-semibold text-[#e10600] hover:underline">Race Results</Link>
          <Link href="/calendar" className="text-[#a3a3a3] text-sm hover:text-[#0a0a0a]">Back to Calendar</Link>
        </div>
      </div>
    </div>
  );
}
