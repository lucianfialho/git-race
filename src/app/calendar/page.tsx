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

const STATUS_TAG: Record<string, { label: string; className: string }> = {
  finished: { label: "Finished", className: "f1-tag-neutral" },
  qualifying: { label: "Qualifying", className: "f1-tag-live" },
  sprint: { label: "Sprint", className: "f1-tag-live" },
  race_day: { label: "Race Day", className: "f1-tag-red" },
  upcoming: { label: "Upcoming", className: "f1-tag-neutral" },
};

export default function CalendarPage() {
  const now = new Date();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="f1-heading text-3xl text-[#0a0a0a] mb-1">2025 Calendar</h1>
        <p className="text-[#a3a3a3] text-sm mb-8">24 Grand Prix following the real F1 schedule</p>

        <div className="space-y-2">
          {F1_2025_CALENDAR.map((gp) => {
            const status = getGPStatus(gp, now);
            const tag = STATUS_TAG[status];
            const isActive = status === "qualifying" || status === "sprint" || status === "race_day";
            const raceDate = new Date(gp.dates.raceDate);
            const href = status === "finished" || status === "race_day" || status === "sprint"
              ? `/gp/${gp.slug}/race` : `/gp/${gp.slug}/qualifying`;

            return (
              <Link
                key={gp.slug}
                href={href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  isActive ? "border-[#0a0a0a] bg-[#fafafa]" : "border-[#e5e5e5] hover:border-[#d4d4d4]"
                }`}
              >
                <span className="text-[#a3a3a3] font-mono text-xs w-6 text-right">{gp.round}</span>
                <span className="text-lg">{COUNTRY_FLAGS[gp.countryCode] ?? ""}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0a0a0a] font-bold text-sm truncate">{gp.name}</p>
                  <p className="text-[#a3a3a3] text-xs">{gp.circuit}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {gp.hasSprint && <span className="f1-tag f1-tag-neutral">Sprint</span>}
                  <span className={`f1-tag ${tag.className}`}>{tag.label}</span>
                  <span className="text-[#a3a3a3] text-xs hidden sm:inline font-mono">
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
