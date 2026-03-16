"use client";

import { useState } from "react";
import Link from "next/link";
import type { CarStats } from "@/lib/race/car-components";
import { CarStatsDisplay } from "@/components/dashboard/car-stats";

interface DashboardClientProps {
  profile: {
    id: string;
    github_username: string;
    avatar_url: string | null;
    car_color: string;
    car_number: number;
    total_points: number;
    car_stats: CarStats;
  };
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

export function DashboardClient({ profile, latestSnapshot, currentGP }: DashboardClientProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();
      setSyncMessage(res.ok ? "Synced! Refresh to see updates." : data.error || "Sync failed");
    } catch {
      setSyncMessage("Network error");
    } finally {
      setSyncing(false);
    }
  };

  const isLive = currentGP?.status === "qualifying" || currentGP?.status === "sprint" || currentGP?.status === "race_day";

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
                  Synced {new Date(latestSnapshot.synced_at).toLocaleString()}
                </p>
              </div>
            )}

            {!latestSnapshot && (
              <div className="rounded-xl border border-[#e5e5e5] p-8 text-center bg-white">
                <p className="text-[#525252] text-sm">No activity data yet. Click Sync to get started.</p>
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
