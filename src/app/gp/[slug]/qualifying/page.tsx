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

export default async function QualifyingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gp = getGPBySlug(slug);
  if (!gp) notFound();

  const now = new Date();
  const status = getGPStatus(gp, now);

  // Determine qualifying phase based on time elapsed
  const qualiStart = new Date(gp.dates.qualiStart);
  const qualiEnd = new Date(gp.dates.qualiEnd);
  const elapsed = (now.getTime() - qualiStart.getTime()) / (qualiEnd.getTime() - qualiStart.getTime());
  const qualiPhase = elapsed < 0.33 ? "Q1" : elapsed < 0.66 ? "Q2" : "Q3";

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
        </div>

        {/* Qualifying status */}
        {status === "upcoming" && (
          <div className="text-center p-8 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 mb-4">Qualifying starts</p>
            <CountdownTimer targetDate={gp.dates.qualiStart} liveLabel="Starting now!" />
            <p className="text-neutral-600 text-xs mt-4">
              Your GitHub contributions from Monday to Friday will determine your grid position
            </p>
          </div>
        )}

        {status === "qualifying" && (
          <>
            <div className="flex items-center justify-center gap-4 mb-6">
              {["Q1", "Q2", "Q3"].map((q) => (
                <div
                  key={q}
                  className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    qualiPhase === q
                      ? "text-white"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                  style={qualiPhase === q ? { background: "var(--gp-primary)" } : undefined}
                >
                  {q}
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 text-center">
              <p className="text-neutral-400 text-sm mb-2">Qualifying ends</p>
              <CountdownTimer targetDate={gp.dates.qualiEnd} liveLabel="Grid Locked" />
              <p className="text-neutral-500 text-xs mt-4">
                Keep contributing on GitHub to improve your position. Updates every 6 hours.
              </p>
            </div>

            {/* Placeholder for qualifying grid */}
            <div className="mt-6 p-8 rounded-xl border border-dashed border-neutral-700 text-center">
              <p className="text-neutral-500">Qualifying grid updates live during the session</p>
              <p className="text-neutral-600 text-xs mt-2">Sign in to see your position</p>
            </div>
          </>
        )}

        {(status === "race_day" || status === "sprint" || status === "finished") && (
          <div className="text-center p-8 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 mb-2">Qualifying is finished</p>
            <p className="text-white font-bold">Grid is locked</p>
            <Link
              href={`/gp/${slug}/race`}
              className="inline-block mt-4 px-6 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "var(--gp-primary)" }}
            >
              View Race Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
