"use client";

import Link from "next/link";
import { CountdownTimer } from "./countdown-timer";
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

interface GPHeroProps {
  gp: {
    slug: string;
    name: string;
    country: string;
    countryCode: string;
    circuit: string;
    round: number;
    hasSprint: boolean;
    themeColors: { primary: string; secondary: string; accent: string };
    dates: {
      qualiStart: string;
      qualiEnd: string;
      sprintDate?: string;
      raceDate: string;
    };
  };
  status: string;
}

const STATUS_CTA: Record<string, string> = {
  qualifying: "See Qualifying Grid",
  sprint: "Sprint Results",
  race_day: "Race in Progress",
  finished: "Race Results",
  upcoming: "Qualifying Schedule",
};

const STATUS_TIMER_LABEL: Record<string, string> = {
  qualifying: "SESSION ENDS IN",
  sprint: "RACE STARTS IN",
  race_day: "RACE STARTS IN",
  upcoming: "QUALIFYING OPENS IN",
  finished: "RACE COMPLETE",
};

export function GPHero({ gp, status }: GPHeroProps) {
  const isLive = status === "qualifying" || status === "sprint" || status === "race_day";
  const flag = COUNTRY_FLAGS[gp.countryCode] ?? "";
  const trackImage = getTrackImage(gp.slug);

  const countdownTarget =
    status === "finished" ? null :
    status === "qualifying" ? gp.dates.qualiEnd :
    status === "sprint" && gp.dates.sprintDate ? gp.dates.sprintDate :
    status === "race_day" ? gp.dates.raceDate :
    gp.dates.qualiStart;

  const linkHref = status === "race_day" || status === "sprint" || status === "finished"
    ? `/gp/${gp.slug}/race`
    : `/gp/${gp.slug}/qualifying`;

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
      {/* Country color accent — diagonal stripe */}
      <div
        className="absolute top-0 right-0 w-[600px] h-full pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 30%, ${gp.themeColors.primary}15 50%, ${gp.themeColors.primary}08 100%)`,
        }}
      />

      {/* Track layout — prominent, not hidden */}
      {trackImage && (
        <img
          src={trackImage}
          alt=""
          className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block w-[320px] h-[320px] object-contain invert opacity-[0.07]"
        />
      )}

      {/* Thin accent bar at top */}
      <div className="h-1" style={{ background: gp.themeColors.primary }} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-10 md:py-14">
          {/* Left: Race info */}
          <div className="flex-1 min-w-0">
            {/* Top line: status + round */}
            <div className="flex items-center gap-3 mb-5">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#e10600] text-white rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {status === "qualifying" ? "QUALIFYING" : status === "sprint" ? "SPRINT" : "RACE DAY"}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                  {status === "finished" ? "LATEST RESULT" : "NEXT RACE"}
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                R{String(gp.round).padStart(2, "0")}/24
              </span>
              {gp.hasSprint && status !== "sprint" && (
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 border border-white/20 px-2 py-0.5 rounded-sm">
                  Sprint
                </span>
              )}
            </div>

            {/* GP Name — massive */}
            <div className="flex items-start gap-4 mb-3">
              <span className="text-4xl mt-1 hidden sm:block">{flag}</span>
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
                  {gp.name.replace(" Grand Prix", "")}
                </h2>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/30 mt-1">
                  Grand Prix
                </p>
              </div>
            </div>

            {/* Circuit */}
            <p className="text-white/50 text-sm mb-6">{gp.circuit}</p>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href={linkHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors"
                style={{ background: gp.themeColors.primary, color: "#fff" }}
              >
                {STATUS_CTA[status] ?? "View Details"}
              </Link>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
              >
                Calendar
              </Link>
            </div>
          </div>

          {/* Right: Countdown panel */}
          <div className="shrink-0 w-full md:w-auto">
            <div className="bg-white/[0.05] border border-white/10 rounded-sm p-5 md:p-6 backdrop-blur-sm md:min-w-[260px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                {STATUS_TIMER_LABEL[status] ?? "NEXT SESSION"}
              </p>

              {countdownTarget && (
                <div className="mb-4">
                  <CountdownTimer targetDate={countdownTarget} variant="dark" />
                </div>
              )}

              {status === "finished" && (
                <p className="text-xl font-bold text-white/60 mb-4">Season 2025</p>
              )}

              {/* Schedule */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <ScheduleRow label="Qualifying" date={gp.dates.qualiStart} active={status === "qualifying"} done={status === "race_day" || status === "sprint" || status === "finished"} />
                {gp.hasSprint && gp.dates.sprintDate && (
                  <ScheduleRow label="Sprint" date={gp.dates.sprintDate} active={status === "sprint"} done={status === "race_day" || status === "finished"} />
                )}
                <ScheduleRow label="Grand Prix" date={gp.dates.raceDate} active={status === "race_day"} done={status === "finished"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleRow({ label, date, active, done }: { label: string; date: string; active: boolean; done: boolean }) {
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
