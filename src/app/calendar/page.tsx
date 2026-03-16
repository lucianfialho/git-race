import Link from "next/link";
import { F1_2025_CALENDAR, F1_2026_CALENDAR, getGPStatus, getNow, type GrandPrix } from "@/lib/f1/calendar";
import { getTrackImage } from "@/lib/f1/track-layouts";

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "\u{1F1E6}\u{1F1FA}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  BH: "\u{1F1E7}\u{1F1ED}", SA: "\u{1F1F8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}", MC: "\u{1F1F2}\u{1F1E8}", ES: "\u{1F1EA}\u{1F1F8}",
  CA: "\u{1F1E8}\u{1F1E6}", AT: "\u{1F1E6}\u{1F1F9}", GB: "\u{1F1EC}\u{1F1E7}",
  BE: "\u{1F1E7}\u{1F1EA}", HU: "\u{1F1ED}\u{1F1FA}", NL: "\u{1F1F3}\u{1F1F1}",
  AZ: "\u{1F1E6}\u{1F1FF}", SG: "\u{1F1F8}\u{1F1EC}", MX: "\u{1F1F2}\u{1F1FD}",
  BR: "\u{1F1E7}\u{1F1F7}", QA: "\u{1F1F6}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
};

function formatRaceDate(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(dateStr);
  return {
    day: String(d.getUTCDate()),
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
  };
}

/* ─── Featured / Next Race Card ─── */
function FeaturedGP({ gp, status }: { gp: GrandPrix; status: string }) {
  const trackImg = getTrackImage(gp.slug);
  const raceDate = formatRaceDate(gp.dates.raceDate);
  const flag = COUNTRY_FLAGS[gp.countryCode] ?? "";
  const isLive = status === "qualifying" || status === "sprint" || status === "race_day";
  const href = isLive || status === "finished" ? `/gp/${gp.slug}/race` : `/gp/${gp.slug}/qualifying`;

  return (
    <Link href={href} className="block group mb-8">
      <div className="relative overflow-hidden bg-[#0a0a0a] rounded-sm">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: gp.themeColors.primary }} />

        {/* Track image background */}
        {trackImg && (
          <img
            src={trackImg}
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[280px] md:h-[280px] object-contain opacity-[0.06] invert group-hover:opacity-[0.12] transition-opacity duration-500"
          />
        )}

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: Round number */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Round</span>
              <p className="text-5xl md:text-6xl font-black text-white leading-none tabular-nums">
                {String(gp.round).padStart(2, "0")}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px h-16 bg-white/10 hidden md:block" />
          </div>

          {/* Center: GP info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#e10600] text-white rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {status === "qualifying" ? "Qualifying" : status === "sprint" ? "Sprint" : "Race Day"}
                </span>
              )}
              {!isLive && (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                  Next Race
                </span>
              )}
              {gp.hasSprint && status !== "sprint" && (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 border border-white/20 px-2 py-0.5 rounded-sm">Sprint</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{flag}</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white leading-tight">
                  {gp.name.replace(" Grand Prix", "")}
                </h2>
                <p className="text-white/30 text-xs uppercase tracking-wider mt-0.5">{gp.circuit}</p>
              </div>
            </div>
          </div>

          {/* Right: Date */}
          <div className="text-left md:text-right shrink-0">
            <p className="text-3xl md:text-4xl font-black text-white leading-none tabular-nums">{raceDate.day}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{raceDate.month}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Regular GP Row ─── */
function GPRow({ gp, now, index }: { gp: GrandPrix; now: Date; index: number }) {
  const status = getGPStatus(gp, now);
  const isFinished = status === "finished";
  const isActive = status === "qualifying" || status === "sprint" || status === "race_day";
  const raceDate = formatRaceDate(gp.dates.raceDate);
  const flag = COUNTRY_FLAGS[gp.countryCode] ?? "";
  const href = isFinished || isActive ? `/gp/${gp.slug}/race` : `/gp/${gp.slug}/qualifying`;

  return (
    <Link
      href={href}
      className="group block"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={`flex items-center gap-0 border-b border-[#f0f0f0] transition-colors ${isFinished ? "opacity-40 hover:opacity-70" : "hover:bg-[#fafafa]"}`}>
        {/* Country color stripe */}
        <div className="w-1 self-stretch shrink-0 rounded-sm" style={{ background: isFinished ? "#e5e5e5" : gp.themeColors.primary }} />

        {/* Round number */}
        <div className="w-14 shrink-0 text-center py-4">
          <span className={`text-lg font-black tabular-nums ${isFinished ? "text-[#d4d4d4]" : "text-[#0a0a0a]"}`}>
            {String(gp.round).padStart(2, "0")}
          </span>
        </div>

        {/* Flag + GP info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 py-4">
          <span className="text-lg shrink-0">{flag}</span>
          <div className="min-w-0">
            <p className={`text-sm font-bold uppercase tracking-tight truncate ${isFinished ? "text-[#a3a3a3]" : "text-[#0a0a0a]"}`}>
              {gp.name.replace(" Grand Prix", "")}
            </p>
            <p className="text-[#a3a3a3] text-xs truncate">{gp.circuit}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 shrink-0 px-2">
          {gp.hasSprint && !isFinished && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-[#e5e5e5] text-[#a3a3a3] rounded-sm hidden sm:inline">
              Sprint
            </span>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#e10600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
              Live
            </span>
          )}
          {isFinished && (
            <span className="text-[10px] font-bold text-[#d4d4d4] uppercase tracking-wider hidden sm:inline">Done</span>
          )}
        </div>

        {/* Date */}
        <div className="w-16 shrink-0 text-right pr-4 py-4">
          <p className={`text-sm font-bold tabular-nums ${isFinished ? "text-[#d4d4d4]" : "text-[#0a0a0a]"}`}>{raceDate.day}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#a3a3a3]">{raceDate.month}</p>
        </div>

        {/* Arrow */}
        <div className="w-6 shrink-0 text-[#d4d4d4] group-hover:text-[#0a0a0a] transition-colors pr-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2l4 4-4 4" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ─── Season Summary Stats ─── */
function SeasonStats({ calendar, now }: { calendar: GrandPrix[]; now: Date }) {
  const finished = calendar.filter((gp) => getGPStatus(gp, now) === "finished").length;
  const remaining = calendar.length - finished;
  const sprints = calendar.filter((gp) => gp.hasSprint).length;
  const countries = new Set(calendar.map((gp) => gp.countryCode)).size;

  return (
    <div className="grid grid-cols-4 gap-0 border border-[#e5e5e5] rounded-sm overflow-hidden mb-8">
      {[
        { value: calendar.length, label: "Races" },
        { value: finished, label: "Complete" },
        { value: remaining, label: "Remaining" },
        { value: sprints, label: "Sprints" },
      ].map((stat, i) => (
        <div key={stat.label} className={`text-center py-4 ${i < 3 ? "border-r border-[#e5e5e5]" : ""}`}>
          <p className="text-2xl font-black text-[#0a0a0a] tabular-nums">{stat.value}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─── */
export default function CalendarPage() {
  const now = getNow();
  const currentYear = now.getFullYear();
  const currentSeason = currentYear >= 2026 ? F1_2026_CALENDAR : F1_2025_CALENDAR;
  const otherSeason = currentYear >= 2026 ? F1_2025_CALENDAR : F1_2026_CALENDAR;
  const currentLabel = currentYear >= 2026 ? "2026" : "2025";
  const otherLabel = currentYear >= 2026 ? "2025" : "2026";

  // Find the next upcoming or active GP for featured card
  const nextGP = currentSeason.find((gp) => {
    const s = getGPStatus(gp, now);
    return s === "qualifying" || s === "sprint" || s === "race_day" || s === "upcoming";
  });
  const nextGPStatus = nextGP ? getGPStatus(nextGP, now) : null;

  // Split into finished and remaining
  const finishedGPs = currentSeason.filter((gp) => getGPStatus(gp, now) === "finished");
  const remainingGPs = currentSeason.filter((gp) => {
    const s = getGPStatus(gp, now);
    return s !== "finished";
  });

  // Remove the featured GP from the remaining list to avoid duplicate
  const upcomingWithoutFeatured = remainingGPs.filter((gp) => gp.slug !== nextGP?.slug);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-2">Season</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#0a0a0a] leading-none">{currentLabel}</h1>
        </div>

        {/* Season stats */}
        <SeasonStats calendar={currentSeason} now={now} />

        {/* Featured next GP */}
        {nextGP && nextGPStatus && (
          <FeaturedGP gp={nextGP} status={nextGPStatus} />
        )}

        {/* Upcoming races */}
        {upcomingWithoutFeatured.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-3">Upcoming</p>
            <div className="border-t border-[#f0f0f0]">
              {upcomingWithoutFeatured.map((gp, i) => (
                <GPRow key={gp.slug} gp={gp} now={now} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Finished races */}
        {finishedGPs.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-3">
              Completed ({finishedGPs.length}/{currentSeason.length})
            </p>
            <div className="border-t border-[#f0f0f0]">
              {finishedGPs.map((gp, i) => (
                <GPRow key={gp.slug} gp={gp} now={now} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Other season */}
        <details className="mt-10 mb-4">
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors py-2">
            {otherLabel} Season — {otherSeason.length} Grand Prix
          </summary>
          <div className="border-t border-[#f0f0f0] mt-2">
            {otherSeason.map((gp, i) => (
              <GPRow key={gp.slug} gp={gp} now={now} index={i} />
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
