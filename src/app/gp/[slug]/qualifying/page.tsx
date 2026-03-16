import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus, getNow } from "@/lib/f1/calendar";
import { CountdownTimer } from "@/components/countdown-timer";

export default async function QualifyingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = getNow();
  const status = getGPStatus(gp, now);
  const qualiStart = new Date(gp.dates.qualiStart);
  const qualiEnd = new Date(gp.dates.qualiEnd);
  const elapsed = (now.getTime() - qualiStart.getTime()) / (qualiEnd.getTime() - qualiStart.getTime());
  const phase = elapsed < 0.33 ? "Q1" : elapsed < 0.66 ? "Q2" : "Q3";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">Round {gp.round} — Qualifying</span>
          <h1 className="f1-heading text-2xl text-[#0a0a0a] mt-1">{gp.name}</h1>
          <p className="text-[#525252] text-sm">{gp.circuit}</p>
        </div>

        {status === "upcoming" && (
          <div className="text-center p-12 rounded-xl border border-[#e5e5e5]">
            <p className="text-[#525252] mb-4">Qualifying starts</p>
            <CountdownTimer targetDate={gp.dates.qualiStart} />
          </div>
        )}

        {status === "qualifying" && (
          <>
            <div className="flex gap-2 mb-6">
              {["Q1", "Q2", "Q3"].map((q) => (
                <div key={q} className={`px-4 py-2 rounded-lg text-sm font-bold ${phase === q ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f5] text-[#a3a3a3]"}`}>
                  {q}
                </div>
              ))}
            </div>
            <div className="p-8 rounded-xl border border-[#e5e5e5] text-center">
              <p className="text-[#525252] text-sm mb-3">Qualifying ends</p>
              <CountdownTimer targetDate={gp.dates.qualiEnd} liveLabel="Grid Locked" />
              <p className="text-[#a3a3a3] text-xs mt-4">Contributing on GitHub improves your position. Updates every 6 hours.</p>
            </div>
          </>
        )}

        {(status === "race_day" || status === "sprint" || status === "finished") && (
          <div className="text-center p-8 rounded-xl border border-[#e5e5e5]">
            <p className="text-[#0a0a0a] font-bold">Grid is locked</p>
            <Link href={`/gp/${slug}/race`} className="f1-btn f1-btn-primary rounded-lg mt-4 text-sm">View Race</Link>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/calendar" className="text-[#a3a3a3] text-sm hover:text-[#0a0a0a]">Back to Calendar</Link>
        </div>
      </div>
    </div>
  );
}
