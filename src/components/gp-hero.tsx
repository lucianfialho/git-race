"use client";

import Link from "next/link";
import { CountdownTimer } from "./countdown-timer";

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

const STATUS_CONFIG: Record<string, { label: string; sublabel: string; icon: string }> = {
  qualifying: {
    label: "QUALIFYING",
    sublabel: "Session is live — contribute to improve your grid position",
    icon: "\u{1F3CE}\u{FE0F}",
  },
  sprint: {
    label: "SPRINT RACE",
    sublabel: "Sprint weekend — shorter race, quick points",
    icon: "\u{26A1}",
  },
  race_day: {
    label: "RACE DAY",
    sublabel: "Grand Prix day — lights out and away we go",
    icon: "\u{1F3C1}",
  },
  upcoming: {
    label: "NEXT RACE",
    sublabel: "Qualifying opens when the race week begins",
    icon: "\u{1F4C5}",
  },
};

export function GPHero({ gp, status }: GPHeroProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;
  const isLive = status === "qualifying" || status === "sprint" || status === "race_day";
  const flag = COUNTRY_FLAGS[gp.countryCode] ?? "";

  const countdownTarget =
    status === "qualifying" ? gp.dates.qualiEnd :
    status === "sprint" && gp.dates.sprintDate ? gp.dates.sprintDate :
    status === "race_day" ? gp.dates.raceDate :
    gp.dates.qualiStart;

  const linkHref = status === "race_day" || status === "sprint" || status === "finished"
    ? `/gp/${gp.slug}/race`
    : `/gp/${gp.slug}/qualifying`;

  return (
    <section className="relative overflow-hidden">
      {/* Colored top bar */}
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, ${gp.themeColors.primary} 0%, ${gp.themeColors.secondary} 50%, ${gp.themeColors.accent} 100%)`,
        }}
      />

      {/* Background gradient wash — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, ${gp.themeColors.primary}, transparent 60%)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          {/* Left: GP info */}
          <div className="flex-1">
            {/* Status badge */}
            <div className="flex items-center gap-3 mb-4">
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0a0a0a] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
                  {config.label}
                </span>
              )}
              {!isLive && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a3a3a3]">
                  {config.label}
                </span>
              )}
              {gp.hasSprint && status !== "sprint" && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f5f5f5] text-[#525252]">
                  Sprint Weekend
                </span>
              )}
            </div>

            {/* Round + Flag */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">{flag}</span>
              <span className="text-[#a3a3a3] text-sm font-semibold">Round {gp.round} of 24</span>
            </div>

            {/* GP Name */}
            <h2 className="f1-heading text-3xl md:text-4xl text-[#0a0a0a] mt-2">
              {gp.name}
            </h2>
            <p className="text-[#525252] mt-1">{gp.circuit}</p>
            <p className="text-[#a3a3a3] text-sm mt-3">{config.sublabel}</p>

            {/* CTA */}
            <div className="flex items-center gap-3 mt-6">
              <Link href={linkHref} className="f1-btn f1-btn-primary rounded-lg text-sm">
                {isLive ? "View Live" : "View Details"}
              </Link>
              <Link href="/calendar" className="f1-btn f1-btn-secondary rounded-lg text-sm">
                Full Calendar
              </Link>
            </div>
          </div>

          {/* Right: Countdown + session info */}
          <div className="md:text-right shrink-0">
            <div className="inline-block p-6 rounded-2xl border border-[#e5e5e5] bg-white/80 backdrop-blur-sm">
              {isLive && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">
                    {status === "qualifying" ? "Session ends in" : "Race starts in"}
                  </span>
                </div>
              )}
              {!isLive && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3]">
                    Qualifying starts in
                  </span>
                </div>
              )}
              {countdownTarget && <CountdownTimer targetDate={countdownTarget} />}

              {/* Race weekend schedule mini */}
              <div className="mt-4 pt-4 border-t border-[#f0f0f0] space-y-1.5">
                <ScheduleRow
                  label="Qualifying"
                  date={gp.dates.qualiStart}
                  active={status === "qualifying"}
                  done={status === "race_day" || status === "sprint" || status === "finished"}
                />
                {gp.hasSprint && gp.dates.sprintDate && (
                  <ScheduleRow
                    label="Sprint"
                    date={gp.dates.sprintDate}
                    active={status === "sprint"}
                    done={status === "race_day" || status === "finished"}
                  />
                )}
                <ScheduleRow
                  label="Grand Prix"
                  date={gp.dates.raceDate}
                  active={status === "race_day"}
                  done={status === "finished"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleRow({
  label,
  date,
  active,
  done,
}: {
  label: string;
  date: string;
  active: boolean;
  done: boolean;
}) {
  const d = new Date(date);
  const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          active ? "bg-[#e10600] animate-pulse" :
          done ? "bg-[#0a0a0a]" :
          "bg-[#d4d4d4]"
        }`}
      />
      <span className={`font-semibold ${active ? "text-[#0a0a0a]" : done ? "text-[#a3a3a3] line-through" : "text-[#525252]"}`}>
        {label}
      </span>
      <span className="text-[#a3a3a3] ml-auto">{dayStr}</span>
    </div>
  );
}
