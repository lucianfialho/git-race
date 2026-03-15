import Link from "next/link";
import { notFound } from "next/navigation";
import { getGPBySlug, getGPStatus } from "@/lib/f1/calendar";
import { CountdownTimer } from "@/components/countdown-timer";

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "\u{1F1E6}\u{1F1FA}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  BH: "\u{1F1E7}\u{1F1ED}", SA: "\u{1F1F8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}", MC: "\u{1F1F2}\u{1F1E8}", ES: "\u{1F1EA}\u{1F1F8}",
  CA: "\u{1F1E8}\u{1F1E6}", AT: "\u{1F1E6}\u{1F1F9}", GB: "\u{1F1EC}\u{1F1E7}",
  BE: "\u{1F1E7}\u{1F1EA}", HU: "\u{1F1ED}\u{1F1FA}", NL: "\u{1F1F3}\u{1F1F1}",
  AZ: "\u{1F1E6}\u{1F1FF}", SG: "\u{1F1F8}\u{1F1EC}", MX: "\u{1F1F2}\u{1F1FD}",
  BR: "\u{1F1E7}\u{1F1F7}", QA: "\u{1F1F6}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
};

export default async function RaceResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = new Date();
  const status = getGPStatus(gp, now);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* GP Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{COUNTRY_FLAGS[gp.countryCode] ?? ""}</span>
            <span className="text-neutral-500 text-sm">Round {gp.round}</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--gp-primary)" }}>
            {gp.name}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">{gp.circuit}</p>
          {gp.hasSprint && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Sprint Weekend
            </span>
          )}
        </div>

        {/* Pre-race state */}
        {(status === "upcoming" || status === "qualifying") && (
          <div className="text-center p-8 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 mb-4">Race starts</p>
            <CountdownTimer targetDate={gp.dates.raceDate} />
            <Link
              href={`/gp/${slug}/qualifying`}
              className="inline-block mt-4 text-sm hover:underline"
              style={{ color: "var(--gp-primary)" }}
            >
              View Qualifying
            </Link>
          </div>
        )}

        {/* Race day / finished - placeholder for results */}
        {(status === "race_day" || status === "sprint" || status === "finished") && (
          <>
            {/* Podium placeholder */}
            <div className="flex items-end justify-center gap-4 mb-8">
              {[
                { pos: 2, height: "h-28", label: "P2" },
                { pos: 1, height: "h-36", label: "P1" },
                { pos: 3, height: "h-20", label: "P3" },
              ].map(({ pos, height, label }) => (
                <div key={pos} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 mb-2" />
                  <span className="text-xs text-neutral-500 mb-1">{label}</span>
                  <div
                    className={`w-24 ${height} rounded-t-lg`}
                    style={{
                      background: pos === 1
                        ? "var(--gp-primary)"
                        : pos === 2
                          ? "var(--gp-secondary)"
                          : "#a3a3a3",
                      opacity: pos === 1 ? 1 : 0.5,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Race timeline placeholder */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
              <h3 className="font-bold mb-4">Race Timeline</h3>
              <div className="space-y-3">
                {[
                  { lap: 1, text: "Lights out and away we go!" },
                  { lap: 15, text: "Safety Car deployed — the field bunches up" },
                  { lap: 32, text: "Pit window opens — strategies diverge" },
                  { lap: 57, text: "Chequered flag! What a race!" },
                ].map((event) => (
                  <div key={event.lap} className="flex gap-3 items-start">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                      L{event.lap}
                    </span>
                    <p className="text-neutral-300 text-sm">{event.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 text-xs mt-4 text-center">
                Full race results available after simulation completes
              </p>
            </div>

            {/* Results table placeholder */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900">
              <h3 className="font-bold mb-4">Classification</h3>
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0">
                    <span className="text-neutral-500 font-mono text-sm w-6">P{i + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-neutral-800" />
                    <div className="flex-1">
                      <div className="h-3 bg-neutral-800 rounded w-24" />
                    </div>
                    <span className="text-neutral-600 text-xs font-mono">
                      {i === 0 ? "25 pts" : `${[25, 18, 15, 12, 10][i]} pts`}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 text-xs mt-4 text-center">
                Sign in to see your detailed results
              </p>
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <Link href="/calendar" className="text-neutral-400 text-sm hover:text-white">
            Back to Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
