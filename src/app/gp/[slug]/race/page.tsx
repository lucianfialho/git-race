import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus, getNow } from "@/lib/f1/calendar";
import { CountdownTimer } from "@/components/countdown-timer";

export default async function RaceResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = getNow();
  const status = getGPStatus(gp, now);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">Round {gp.round} — Race</span>
          <h1 className="f1-heading text-2xl text-[#0a0a0a] mt-1">{gp.name}</h1>
          <p className="text-[#525252] text-sm">{gp.circuit}</p>
          {gp.hasSprint && <span className="f1-tag f1-tag-neutral mt-2">Sprint Weekend</span>}
        </div>

        {(status === "upcoming" || status === "qualifying") && (
          <div className="text-center p-12 rounded-xl border border-[#e5e5e5]">
            <p className="text-[#525252] mb-4">Race starts</p>
            <CountdownTimer targetDate={gp.dates.raceDate} />
            <Link href={`/gp/${slug}/qualifying`} className="inline-block mt-4 text-sm font-semibold text-[#e10600] hover:underline">
              View Qualifying
            </Link>
          </div>
        )}

        {(status === "race_day" || status === "sprint" || status === "finished") && (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-6 mb-10 pt-4">
              {[
                { pos: "P2", h: "h-24" },
                { pos: "P1", h: "h-32" },
                { pos: "P3", h: "h-16" },
              ].map(({ pos, h }) => (
                <div key={pos} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] mb-2" />
                  <span className="text-xs font-bold text-[#a3a3a3] mb-1">{pos}</span>
                  <div className={`w-20 ${h} rounded-t-lg ${pos === "P1" ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]"}`} />
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-[#e5e5e5] p-6 mb-6">
              <h3 className="font-bold text-[#0a0a0a] mb-4">Race Timeline</h3>
              <div className="space-y-3">
                {[
                  { lap: 1, text: "Lights out and away we go!" },
                  { lap: 15, text: "Safety Car deployed" },
                  { lap: 32, text: "Pit window opens" },
                  { lap: 57, text: "Chequered flag!" },
                ].map((e) => (
                  <div key={e.lap} className="flex gap-3 items-start">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#f5f5f5] text-[#525252] shrink-0">L{e.lap}</span>
                    <p className="text-[#525252] text-sm">{e.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification */}
            <div className="rounded-xl border border-[#e5e5e5] p-6">
              <h3 className="font-bold text-[#0a0a0a] mb-4">Classification</h3>
              <div className="space-y-2">
                {[25, 18, 15, 12, 10].map((pts, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f5f5f5] last:border-0">
                    <span className="text-[#a3a3a3] font-mono text-sm w-6 font-bold">P{i + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-[#f5f5f5]" />
                    <div className="flex-1"><div className="h-3 bg-[#f5f5f5] rounded w-24" /></div>
                    <span className="text-[#a3a3a3] text-xs font-mono">{pts} pts</span>
                  </div>
                ))}
              </div>
              <p className="text-[#a3a3a3] text-xs mt-4 text-center">Sign in to see your results</p>
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <Link href="/calendar" className="text-[#a3a3a3] text-sm hover:text-[#0a0a0a]">Back to Calendar</Link>
        </div>
      </div>
    </div>
  );
}
