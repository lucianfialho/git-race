import Link from "next/link";
import { F1_2025_CALENDAR, getGPStatus } from "@/lib/f1/calendar";

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "\u{1F1E6}\u{1F1FA}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  BH: "\u{1F1E7}\u{1F1ED}", SA: "\u{1F1F8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}", MC: "\u{1F1F2}\u{1F1E8}", ES: "\u{1F1EA}\u{1F1F8}",
  CA: "\u{1F1E8}\u{1F1E6}", AT: "\u{1F1E6}\u{1F1F9}", GB: "\u{1F1EC}\u{1F1E7}",
  BE: "\u{1F1E7}\u{1F1EA}", HU: "\u{1F1ED}\u{1F1FA}", NL: "\u{1F1F3}\u{1F1F1}",
  AZ: "\u{1F1E6}\u{1F1FF}", SG: "\u{1F1F8}\u{1F1EC}", MX: "\u{1F1F2}\u{1F1FD}",
  BR: "\u{1F1E7}\u{1F1F7}", QA: "\u{1F1F6}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  finished: { label: "Finished", className: "bg-neutral-800 text-neutral-400" },
  qualifying: { label: "Qualifying", className: "bg-green-500/20 text-green-400 border border-green-500/30" },
  sprint: { label: "Sprint Day", className: "bg-purple-500/20 text-purple-400 border border-purple-500/30" },
  race_day: { label: "Race Day", className: "bg-red-500/20 text-red-400 border border-red-500/30" },
  upcoming: { label: "Upcoming", className: "bg-neutral-800 text-neutral-500" },
};

export default function CalendarPage() {
  const now = new Date();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-2">2025 Calendar</h1>
        <p className="text-neutral-400 mb-8">24 races following the real F1 schedule</p>

        <div className="space-y-3">
          {F1_2025_CALENDAR.map((gp) => {
            const status = getGPStatus(gp, now);
            const badge = STATUS_BADGE[status];
            const isActive = status === "qualifying" || status === "sprint" || status === "race_day";
            const raceDate = new Date(gp.dates.raceDate);
            const href = status === "finished" || status === "race_day" || status === "sprint"
              ? `/gp/${gp.slug}/race`
              : `/gp/${gp.slug}/qualifying`;

            return (
              <Link
                key={gp.slug}
                href={href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  isActive
                    ? "border-neutral-600 bg-neutral-800/50 ring-1"
                    : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800/50"
                }`}
                style={isActive ? { boxShadow: "0 0 0 1px var(--gp-primary)" } : undefined}
              >
                <span className="text-neutral-600 font-mono text-sm w-8 text-center">
                  R{gp.round}
                </span>
                <span className="text-xl">{COUNTRY_FLAGS[gp.countryCode] ?? ""}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{gp.name}</p>
                  <p className="text-neutral-500 text-xs">{gp.circuit}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {gp.hasSprint && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Sprint
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-neutral-600 text-xs hidden sm:inline">
                    {raceDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
