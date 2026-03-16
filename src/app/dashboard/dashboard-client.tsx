"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CarStats } from "@/lib/race/car-components";
import { CarStatsDisplay } from "@/components/dashboard/car-stats";

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

  const isLive = currentGP?.status === "qualifying" || currentGP?.status === "sprint" || currentGP?.status === "race_day";

  const DIVISION_BADGE_CLASS: Record<number, string> = {
    1: "bg-[#f0f0f0] text-[#525252]",
    2: "bg-[#0a0a0a] text-white",
    3: "bg-[#e10600] text-white",
  };
  const badgeClass = DIVISION_BADGE_CLASS[profile.divisionLevel] ?? DIVISION_BADGE_CLASS[1];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#e5e5e5]">
          <img
            src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
            alt={profile.github_username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <h1 className="font-bold text-xl text-[#0a0a0a]">{profile.github_username}</h1>
            <div className="flex items-center gap-3 text-[#a3a3a3] text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeClass}`}>{profile.division}</span>
              <span className="font-mono">#{profile.car_number}</span>
              <span>{profile.total_points} pts</span>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="f1-btn f1-btn-secondary text-xs rounded-lg"
          >
            {syncing ? "Syncing..." : "Sync GitHub"}
          </button>
        </div>
        {syncMessage && <p className="text-sm text-[#525252] mb-4 -mt-4">{syncMessage}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <CarStatsDisplay stats={profile.car_stats} />

          <div className="space-y-6">
            {/* GP Card */}
            {currentGP && (
              <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    {isLive ? currentGP.status.replace("_", " ") : "Next Race"}
                  </span>
                  {isLive && <span className="w-2 h-2 rounded-full bg-[#e10600] animate-pulse" />}
                </div>
                <h3 className="font-bold text-[#0a0a0a]">{currentGP.name}</h3>
                <p className="text-[#a3a3a3] text-sm mt-0.5">{currentGP.circuit}</p>
                {currentGP.hasSprint && <span className="f1-tag f1-tag-neutral mt-2">Sprint Weekend</span>}
                <div className="flex gap-2 mt-4">
                  <Link href={`/gp/${currentGP.slug}/qualifying`} className="f1-btn f1-btn-secondary text-xs rounded-lg py-2 px-3">Qualifying</Link>
                  <Link href={`/gp/${currentGP.slug}/race`} className="f1-btn f1-btn-primary text-xs rounded-lg py-2 px-3">Race</Link>
                </div>
              </div>
            )}

            {/* Rival Battle */}
            {rivals.length > 0 && (
              <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
                <div className="px-6 pt-5 pb-3">
                  <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Battle Zone</span>
                </div>
                {rivals.map((rival) => {
                  const ahead = rival.pointsDiff > 0;
                  const diff = Math.abs(rival.pointsDiff);
                  return (
                    <div key={rival.id} className="px-6 pb-5">
                      <div className="flex items-center gap-3">
                        {/* You */}
                        <div className="flex-1 text-right">
                          <img
                            src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
                            alt={profile.github_username}
                            className="w-10 h-10 rounded-full ml-auto border-2 border-[#0a0a0a]"
                          />
                          <p className="text-sm font-bold text-[#0a0a0a] mt-1.5 truncate">{profile.github_username}</p>
                          <p className="text-xs font-mono text-[#525252]">{profile.total_points} pts</p>
                        </div>

                        {/* VS divider */}
                        <div className="flex flex-col items-center px-3">
                          <div className="w-px h-4 bg-[#e5e5e5]" />
                          <span className="text-xs font-black text-[#0a0a0a] tracking-widest my-1">VS</span>
                          <div className="w-px h-4 bg-[#e5e5e5]" />
                          <span className={`text-[10px] font-bold mt-1 ${ahead ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                            {ahead ? `+${diff}` : `-${diff}`}
                          </span>
                        </div>

                        {/* Rival */}
                        <div className="flex-1">
                          <img
                            src={rival.avatar_url || `https://github.com/${rival.username}.png`}
                            alt={rival.username}
                            className="w-10 h-10 rounded-full border-2 border-[#d4d4d4]"
                          />
                          <p className="text-sm font-bold text-[#0a0a0a] mt-1.5 truncate">{rival.username}</p>
                          <p className="text-xs font-mono text-[#525252]">{rival.points} pts</p>
                        </div>
                      </div>

                      <Link
                        href={`/compare/${profile.github_username}/${rival.username}`}
                        className="block text-center text-xs font-semibold text-[#525252] hover:text-[#0a0a0a] mt-4 py-2 rounded-lg border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors"
                      >
                        Compare head-to-head
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* GitHub Profile Stats */}
            {profile.github_stats && (profile.github_stats.total_stars !== undefined || profile.github_stats.total_repos !== undefined) && (
              <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
                <h3 className="font-bold text-[#0a0a0a] mb-4">GitHub Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Stars", value: profile.github_stats.total_stars ?? 0, icon: "\u{2B50}" },
                    { label: "Repos", value: profile.github_stats.total_repos ?? 0, icon: "\u{1F4E6}" },
                    { label: "Followers", value: profile.github_stats.followers ?? 0, icon: "\u{1F465}" },
                    { label: "Following", value: profile.github_stats.following ?? 0, icon: "\u{1F464}" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-sm">{stat.icon}</span>
                      <div>
                        <p className="text-lg font-black text-[#0a0a0a] leading-none">{stat.value.toLocaleString()}</p>
                        <p className="text-[#a3a3a3] text-xs">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {profile.github_stats.top_languages && profile.github_stats.top_languages.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                    <p className="text-[#a3a3a3] text-xs mb-2">Top Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.github_stats.top_languages.map((lang: string) => (
                        <span key={lang} className="text-xs px-2 py-0.5 rounded bg-[#f5f5f5] text-[#525252] font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity */}
            {latestSnapshot && (
              <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
                <h3 className="font-bold text-[#0a0a0a] mb-4">This Week</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Commits", value: latestSnapshot.commits_count },
                    { label: "PRs Merged", value: latestSnapshot.prs_merged },
                    { label: "Reviews", value: latestSnapshot.prs_reviewed },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-black text-[#0a0a0a]">{stat.value}</p>
                      <p className="text-[#a3a3a3] text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[#a3a3a3] text-xs mt-4 pt-4 border-t border-[#f0f0f0]">
                  Synced {new Date(latestSnapshot.synced_at).toISOString().replace("T", " ").slice(0, 16)} UTC
                </p>
              </div>
            )}

            {!latestSnapshot && (
              <div className="rounded-xl border border-[#e5e5e5] p-6 bg-white">
                <h3 className="font-bold text-[#0a0a0a] mb-4">Get Started</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0a0a0a] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="flex-1">
                      <p className="text-[#0a0a0a] text-sm font-semibold">Sync your GitHub activity</p>
                      <p className="text-[#a3a3a3] text-xs mt-0.5">We'll read your contributions from this week to build your car stats.</p>
                      <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="f1-btn f1-btn-primary rounded-lg text-xs mt-2 py-2 px-4"
                      >
                        {syncing ? "Syncing..." : "Sync Now"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <span className="w-6 h-6 rounded-full bg-[#e5e5e5] text-[#525252] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-[#0a0a0a] text-sm font-semibold">Qualify for the race (Mon–Fri)</p>
                      <p className="text-[#a3a3a3] text-xs mt-0.5">Your contributions during the week determine your grid position.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <span className="w-6 h-6 rounded-full bg-[#e5e5e5] text-[#525252] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-[#0a0a0a] text-sm font-semibold">Race on the weekend</p>
                      <p className="text-[#a3a3a3] text-xs mt-0.5">Race simulation runs on Sunday with overtakes, pit stops, and F1 points.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3">
              {[
                { label: "Profile", href: `/driver/${profile.github_username}` },
                { label: "Standings", href: "/leaderboard" },
                { label: "Achievements", href: "/achievements" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="flex-1 text-center text-sm py-2.5 rounded-lg border border-[#e5e5e5] text-[#525252] hover:text-[#0a0a0a] hover:border-[#d4d4d4] transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
