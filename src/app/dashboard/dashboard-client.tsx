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

export function DashboardClient({
  profile,
  latestSnapshot,
  currentGP,
}: DashboardClientProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage("Synced! Refresh to see updates.");
      } else {
        setSyncMessage(data.error || "Sync failed");
      }
    } catch {
      setSyncMessage("Network error");
    } finally {
      setSyncing(false);
    }
  };

  const statusLabel =
    currentGP?.status === "qualifying" ? "Qualifying Live" :
    currentGP?.status === "sprint" ? "Sprint Day" :
    currentGP?.status === "race_day" ? "Race Day" :
    "Next Race";

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
            alt={profile.github_username}
            className="w-14 h-14 rounded-full border-2 border-neutral-700"
          />
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{profile.github_username}</h1>
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <span className="font-mono">#{profile.car_number}</span>
              <span>{profile.total_points} pts</span>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-sm px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 disabled:opacity-50 transition-colors"
          >
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>
        {syncMessage && (
          <p className="text-sm text-neutral-500 mb-4 -mt-4">{syncMessage}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Car Stats */}
          <CarStatsDisplay stats={profile.car_stats} />

          {/* Right column */}
          <div className="space-y-6">
            {/* Current GP card */}
            {currentGP && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-neutral-500">{statusLabel}</span>
                  {(currentGP.status === "qualifying" || currentGP.status === "sprint" || currentGP.status === "race_day") && (
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--gp-primary)" }} />
                  )}
                </div>
                <h3 className="font-bold text-white text-lg">{currentGP.name}</h3>
                <p className="text-neutral-500 text-sm mt-0.5">{currentGP.circuit}</p>
                {currentGP.hasSprint && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Sprint Weekend
                  </span>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/gp/${currentGP.slug}/qualifying`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
                  >
                    Qualifying
                  </Link>
                  <Link
                    href={`/gp/${currentGP.slug}/race`}
                    className="text-xs px-3 py-1.5 rounded-lg text-white"
                    style={{ background: "var(--gp-primary)" }}
                  >
                    Race
                  </Link>
                </div>
              </div>
            )}

            {/* Activity Summary */}
            {latestSnapshot && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <h3 className="font-bold text-white mb-4">This Week</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Commits", value: latestSnapshot.commits_count },
                    { label: "PRs", value: latestSnapshot.prs_merged },
                    { label: "Reviews", value: latestSnapshot.prs_reviewed },
                    { label: "Issues", value: latestSnapshot.issues_opened + latestSnapshot.issues_closed },
                    { label: "PRs Opened", value: latestSnapshot.prs_opened },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-white text-xl font-bold">{stat.value}</p>
                      <p className="text-neutral-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-neutral-600 text-xs mt-4">
                  Last synced: {new Date(latestSnapshot.synced_at).toLocaleString()}
                </p>
              </div>
            )}

            {!latestSnapshot && (
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 text-center">
                <p className="text-neutral-400 text-sm">
                  No activity data yet. Click Sync to get started!
                </p>
              </div>
            )}

            {/* Quick links */}
            <div className="flex gap-3">
              <Link
                href={`/driver/${profile.github_username}`}
                className="flex-1 text-center text-sm py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                My Profile
              </Link>
              <Link
                href="/leaderboard"
                className="flex-1 text-center text-sm py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                Standings
              </Link>
              <Link
                href="/achievements"
                className="flex-1 text-center text-sm py-2.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                Achievements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
