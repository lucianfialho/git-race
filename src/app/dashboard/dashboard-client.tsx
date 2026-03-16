"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CarStats } from "@/lib/race/car-components";
import { calculateOverallRating } from "@/lib/race/car-components";
import { DIVISION_CONFIG, getNextDivisionThreshold, getCurrentDivisionThreshold } from "@/lib/race/divisions";

interface RivalData {
  id: string;
  username: string;
  avatar_url: string | null;
  points: number;
  position: number;
  pointsDiff: number;
}

interface DashboardClientProps {
  profile: {
    id: string;
    github_username: string;
    avatar_url: string | null;
    car_color: string;
    car_number: number;
    total_points: number;
    car_stats: CarStats;
    github_stats: {
      total_stars?: number;
      total_repos?: number;
      followers?: number;
      following?: number;
      top_languages?: string[];
    } | null;
    division: string;
    divisionLevel: number;
    positionInDivision: number;
    totalInDivision: number;
    zone: "promotion" | "relegation" | null;
  };
  rivals: RivalData[];
  latestSnapshot: {
    commits_count: number;
    prs_opened: number;
    prs_merged: number;
    prs_reviewed: number;
    issues_opened: number;
    issues_closed: number;
    speed_score: number;
    consistency_score: number;
    impact_score: number;
    power_unit_score?: number;
    aero_score?: number;
    reliability_score?: number;
    tire_mgmt_score?: number;
    strategy_score?: number;
    synced_at: string;
  } | null;
  currentGP: {
    name: string;
    slug: string;
    circuit: string;
    countryCode: string;
    status: string;
    qualiEnd: string;
    raceDate: string;
    hasSprint: boolean;
  } | null;
}

const CAR_COMPONENTS = [
  { key: "power_unit" as const, label: "PWR", name: "Power Unit", hint: "Commits" },
  { key: "aero" as const, label: "AER", name: "Aerodynamics", hint: "Pull Requests" },
  { key: "reliability" as const, label: "REL", name: "Reliability", hint: "Daily Activity" },
  { key: "tire_mgmt" as const, label: "TIR", name: "Tire Mgmt", hint: "Code Reviews" },
  { key: "strategy" as const, label: "STR", name: "Strategy", hint: "Issues" },
];

const DIV_COLORS: Record<number, string> = { 1: "#a3a3a3", 2: "#0a0a0a", 3: "#e10600" };

export function DashboardClient({ profile, rivals, latestSnapshot, currentGP }: DashboardClientProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage("Synced!");
        router.refresh();
      } else {
        setSyncMessage(data.error || "Sync failed");
      }
    } catch {
      setSyncMessage("Network error");
    } finally {
      setSyncing(false);
    }
  };

  const overall = calculateOverallRating(profile.car_stats);
  const isLive = currentGP?.status === "qualifying" || currentGP?.status === "sprint" || currentGP?.status === "race_day";
  const divColor = DIV_COLORS[profile.divisionLevel] ?? "#a3a3a3";

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Dark Hero: Driver Identity ─── */}
      <section className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: divColor }} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="flex items-center justify-between gap-6">
            {/* Driver info */}
            <div className="flex items-center gap-5">
              <img
                src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
                alt=""
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
                style={{ borderColor: divColor }}
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    {profile.github_username}
                  </h1>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                    style={{ background: divColor, color: profile.divisionLevel === 1 ? "#0a0a0a" : "#fff" }}
                  >
                    {profile.division}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-white/40 text-sm">
                  <span className="font-mono">#{profile.car_number}</span>
                  <span className="font-bold tabular-nums">{profile.total_points} <span className="text-[10px] tracking-wider">PTS</span></span>
                </div>
              </div>
            </div>

            {/* Overall rating + Sync */}
            <div className="flex items-center gap-4">
              <div className="text-center hidden sm:block">
                <p className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none">{Math.round(overall)}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">Overall</p>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] border border-white/20 text-white/60 hover:text-white hover:border-white/40 rounded-sm transition-colors disabled:opacity-30"
              >
                {syncing ? "Syncing..." : "Sync"}
              </button>
            </div>
          </div>
          {syncMessage && <p className="text-white/40 text-xs mt-2">{syncMessage}</p>}
        </div>
      </section>

      {/* ─── Division Progress ─── */}
      <DivisionProgress
        divisionLevel={profile.divisionLevel}
        divisionName={profile.division}
        totalPoints={profile.total_points}
        positionInDivision={profile.positionInDivision}
        totalInDivision={profile.totalInDivision}
        zone={profile.zone}
      />

      {/* ─── Car Telemetry: 5 components as horizontal gauges ─── */}
      <section className="border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-5 gap-0 divide-x divide-[#e5e5e5]">
            {CAR_COMPONENTS.map(({ key, label, name, hint }) => {
              const value = profile.car_stats[key];
              return (
                <div key={key} className="py-5 px-3 md:px-4 text-center group">
                  <p className="text-2xl md:text-3xl font-black text-[#0a0a0a] tabular-nums leading-none">{Math.round(value)}</p>
                  <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden mt-2 mx-auto max-w-[80px]">
                    <div className="h-full bg-[#0a0a0a] rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a] mt-2">{label}</p>
                  <p className="text-[9px] text-[#a3a3a3] mt-0.5 hidden md:block">{hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Race Status */}
            {currentGP && (
              <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
                <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                    {isLive ? currentGP.status.replace("_", " ") : "Next Race"}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#e10600]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold uppercase tracking-tight text-[#0a0a0a]">
                    {currentGP.name.replace(" Grand Prix", "")}
                  </h3>
                  <p className="text-[#a3a3a3] text-xs uppercase tracking-wider mt-0.5">{currentGP.circuit}</p>
                  {currentGP.hasSprint && (
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#e5e5e5] text-[#a3a3a3] rounded-sm">
                      Sprint Weekend
                    </span>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/gp/${currentGP.slug}/qualifying`} className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] border border-[#e5e5e5] text-[#525252] hover:text-[#0a0a0a] hover:border-[#d4d4d4] rounded-sm transition-colors">
                      Qualifying
                    </Link>
                    <Link href={`/gp/${currentGP.slug}/race`} className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] bg-[#0a0a0a] text-white rounded-sm hover:bg-[#262626] transition-colors">
                      Race
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Battle Zone */}
            {rivals.length > 0 && (
              <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
                <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Rival Battle</span>
                </div>
                {rivals.map((rival) => {
                  const ahead = rival.pointsDiff > 0;
                  const diff = Math.abs(rival.pointsDiff);
                  return (
                    <div key={rival.id} className="p-5">
                      <div className="flex items-center">
                        {/* You */}
                        <div className="flex-1 flex items-center gap-3">
                          <img src={profile.avatar_url || ""} alt="" className="w-10 h-10 rounded-full border-2 border-[#0a0a0a]" />
                          <div>
                            <p className="text-sm font-bold text-[#0a0a0a]">{profile.github_username}</p>
                            <p className="text-xs text-[#a3a3a3] tabular-nums">{profile.total_points} pts</p>
                          </div>
                        </div>

                        {/* Gap */}
                        <div className="px-4 text-center">
                          <p className={`text-lg font-black tabular-nums ${ahead ? "text-[#0a0a0a]" : "text-[#e10600]"}`}>
                            {ahead ? `+${diff}` : `-${diff}`}
                          </p>
                          <p className="text-[8px] uppercase tracking-wider text-[#a3a3a3]">Gap</p>
                        </div>

                        {/* Rival */}
                        <div className="flex-1 flex items-center gap-3 justify-end text-right">
                          <div>
                            <p className="text-sm font-bold text-[#0a0a0a]">{rival.username}</p>
                            <p className="text-xs text-[#a3a3a3] tabular-nums">{rival.points} pts</p>
                          </div>
                          <img src={rival.avatar_url || ""} alt="" className="w-10 h-10 rounded-full border-2 border-[#e5e5e5]" />
                        </div>
                      </div>

                      <Link
                        href={`/compare/${profile.github_username}/${rival.username}`}
                        className="block text-center mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
                      >
                        Compare &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity — This Week */}
            {latestSnapshot && (
              <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
                <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">This Week</span>
                  <span className="text-[9px] text-[#a3a3a3]">
                    {new Date(latestSnapshot.synced_at).toISOString().replace("T", " ").slice(0, 16)} UTC
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-0 divide-x divide-[#f0f0f0]">
                  {[
                    { label: "Commits", value: latestSnapshot.commits_count },
                    { label: "PRs", value: latestSnapshot.prs_merged },
                    { label: "Reviews", value: latestSnapshot.prs_reviewed },
                    { label: "Issues", value: latestSnapshot.issues_opened + latestSnapshot.issues_closed },
                    { label: "PRs Open", value: latestSnapshot.prs_opened },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center py-4 px-2">
                      <p className="text-xl font-black text-[#0a0a0a] tabular-nums">{stat.value}</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#a3a3a3] mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onboarding */}
            {!latestSnapshot && (
              <div className="border border-[#e5e5e5] rounded-sm p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-4">Get Started</p>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Sync your GitHub activity", desc: "We'll read your contributions to build car stats.", active: true },
                    { step: 2, title: "Qualify for the race (Mon–Fri)", desc: "Your contributions determine your grid position.", active: false },
                    { step: 3, title: "Race on the weekend", desc: "Simulation runs on Sunday with F1 points.", active: false },
                  ].map((s) => (
                    <div key={s.step} className={`flex items-start gap-3 ${s.active ? "" : "opacity-40"}`}>
                      <span className={`w-6 h-6 rounded-sm text-xs font-black flex items-center justify-center shrink-0 ${s.active ? "bg-[#0a0a0a] text-white" : "bg-[#f0f0f0] text-[#a3a3a3]"}`}>
                        {s.step}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0a0a0a]">{s.title}</p>
                        <p className="text-xs text-[#a3a3a3] mt-0.5">{s.desc}</p>
                        {s.active && (
                          <button onClick={handleSync} disabled={syncing} className="mt-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] bg-[#0a0a0a] text-white rounded-sm hover:bg-[#262626] transition-colors disabled:opacity-30">
                            {syncing ? "Syncing..." : "Sync Now"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* GitHub Stats */}
            {profile.github_stats && (profile.github_stats.total_stars !== undefined) && (
              <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
                <div className="bg-[#fafafa] px-5 py-3 border-b border-[#e5e5e5]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">GitHub</span>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Stars", value: profile.github_stats.total_stars ?? 0 },
                    { label: "Repositories", value: profile.github_stats.total_repos ?? 0 },
                    { label: "Followers", value: profile.github_stats.followers ?? 0 },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#a3a3a3]">{stat.label}</span>
                      <span className="text-sm font-black text-[#0a0a0a] tabular-nums">{stat.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {profile.github_stats.top_languages && profile.github_stats.top_languages.length > 0 && (
                    <div className="pt-3 border-t border-[#f0f0f0]">
                      <div className="flex flex-wrap gap-1">
                        {profile.github_stats.top_languages.map((lang: string) => (
                          <span key={lang} className="text-[10px] px-2 py-0.5 bg-[#f5f5f5] text-[#525252] font-semibold rounded-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="space-y-2">
              {[
                { label: "My Profile", href: `/driver/${profile.github_username}`, icon: "\u{2192}" },
                { label: "Standings", href: "/leaderboard", icon: "\u{2192}" },
                { label: "Achievements", href: "/achievements", icon: "\u{2192}" },
                { label: "Calendar", href: "/calendar", icon: "\u{2192}" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 border border-[#e5e5e5] rounded-sm hover:border-[#d4d4d4] hover:bg-[#fafafa] transition-colors group"
                >
                  <span className="text-sm font-bold text-[#0a0a0a]">{link.label}</span>
                  <span className="text-[#d4d4d4] group-hover:text-[#0a0a0a] transition-colors text-sm">{link.icon}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Division Progress Sub-component ─── */
function DivisionProgress({
  divisionLevel,
  divisionName,
  totalPoints,
  positionInDivision,
  totalInDivision,
  zone,
}: {
  divisionLevel: number;
  divisionName: string;
  totalPoints: number;
  positionInDivision: number;
  totalInDivision: number;
  zone: "promotion" | "relegation" | null;
}) {
  const nextThreshold = getNextDivisionThreshold(divisionLevel);
  const currentThreshold = getCurrentDivisionThreshold(divisionLevel);
  const nextConfig = DIVISION_CONFIG.find((d) => d.level === divisionLevel + 1);
  const divColor = DIV_COLORS[divisionLevel] ?? "#a3a3a3";

  // Progress within current division toward next
  let progressPct = 100;
  let pointsToNext = 0;
  if (nextThreshold !== null) {
    const range = nextThreshold - currentThreshold;
    const progress = totalPoints - currentThreshold;
    progressPct = Math.min(100, Math.max(0, (progress / range) * 100));
    pointsToNext = Math.max(0, nextThreshold - totalPoints);
  }

  return (
    <section className="border-b border-[#e5e5e5]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Division label + position */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm"
                style={{ background: divColor, color: divisionLevel === 1 ? "#0a0a0a" : "#fff" }}
              >
                Division {divisionName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                P{positionInDivision} / {totalInDivision}
              </span>
            </div>

            {/* Zone badge */}
            {zone === "promotion" && (
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-green-500 text-white">
                Promotion Zone
              </span>
            )}
            {zone === "relegation" && (
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-[#e10600] text-white">
                Relegation Zone
              </span>
            )}
          </div>

          {/* Progress toward next division */}
          {nextThreshold !== null && nextConfig && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3] whitespace-nowrap">
                  {nextConfig.name}
                </span>
                <div className="w-32 md:w-48 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: nextConfig.gridColor,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold tabular-nums text-[#525252] whitespace-nowrap">
                {pointsToNext} pts to go
              </span>
            </div>
          )}

          {nextThreshold === null && (
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a3a3a3]">
              Top Division
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
