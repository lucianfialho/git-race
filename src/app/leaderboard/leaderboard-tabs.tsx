"use client";

import { useState } from "react";
import Link from "next/link";

interface Driver {
  profileId: string;
  username: string;
  avatarUrl: string;
  carNumber: number;
  totalPoints: number;
  position: number;
  wins: number;
  podiums: number;
}

interface Org {
  name: string;
  totalPoints: number;
  drivers: number;
  members: Array<{ avatar: string; username: string }>;
}

export function LeaderboardTabs({ drivers, orgs, leaderPoints }: { drivers: Driver[]; orgs: Org[]; leaderPoints: number }) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");

  const orgLeaderPoints = orgs[0]?.totalPoints || 1;

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[#e5e5e5]">
        {(["drivers", "constructors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#e10600] text-[#0a0a0a]"
                : "border-transparent text-[#a3a3a3] hover:text-[#525252]"
            }`}
          >
            {t === "drivers" ? "Drivers" : "Constructors"}
          </button>
        ))}
      </div>

      {tab === "drivers" && (
        <div>
          {drivers.length > 0 ? (
            <div className="space-y-0">
              {drivers.map((entry, i) => {
                const barWidth = leaderPoints > 0 ? (entry.totalPoints / leaderPoints) * 100 : 0;
                const isTop3 = entry.position <= 3;

                return (
                  <Link
                    key={entry.profileId}
                    href={`/driver/${entry.username}`}
                    className="group flex items-center gap-0 border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors"
                  >
                    {/* Position */}
                    <div className="w-14 shrink-0 text-center py-4">
                      <span className={`text-lg font-black tabular-nums ${isTop3 ? "text-[#0a0a0a]" : "text-[#d4d4d4]"}`}>
                        {String(entry.position).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Accent stripe */}
                    <div
                      className="w-1 self-stretch shrink-0 rounded-sm"
                      style={{ background: entry.position === 1 ? "#e10600" : entry.position <= 3 ? "#0a0a0a" : "#f0f0f0" }}
                    />

                    {/* Driver info */}
                    <div className="flex items-center gap-3 px-4 py-4 flex-1 min-w-0">
                      <img
                        src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                        alt=""
                        className="w-8 h-8 rounded-full shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0a0a0a] truncate">{entry.username}</p>
                        <p className="text-[10px] text-[#a3a3a3] font-mono">#{entry.carNumber}</p>
                      </div>
                    </div>

                    {/* Points bar */}
                    <div className="hidden md:flex items-center gap-3 w-48 shrink-0 pr-2">
                      <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            background: entry.position === 1 ? "#e10600" : "#0a0a0a",
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0 pr-2">
                      <div className="text-center w-10">
                        <p className="text-xs font-bold text-[#0a0a0a] tabular-nums">{entry.wins}</p>
                        <p className="text-[8px] uppercase tracking-wider text-[#a3a3a3]">Win</p>
                      </div>
                      <div className="text-center w-10">
                        <p className="text-xs font-bold text-[#0a0a0a] tabular-nums">{entry.podiums}</p>
                        <p className="text-[8px] uppercase tracking-wider text-[#a3a3a3]">Pod</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="w-20 shrink-0 text-right pr-4 py-4">
                      <p className={`text-lg font-black tabular-nums ${isTop3 ? "text-[#0a0a0a]" : "text-[#525252]"}`}>
                        {entry.totalPoints}
                      </p>
                      <p className="text-[8px] uppercase tracking-wider text-[#a3a3a3]">Pts</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#a3a3a3] text-sm">No drivers yet.</p>
              <Link href="/login" className="text-[#e10600] text-sm font-bold hover:underline mt-2 inline-block">
                Be the first to race
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === "constructors" && (
        <div>
          {orgs.length > 0 ? (
            <div className="space-y-0">
              {orgs.map((org, i) => {
                const barWidth = orgLeaderPoints > 0 ? (org.totalPoints / orgLeaderPoints) * 100 : 0;
                const isTop3 = i < 3;

                return (
                  <div
                    key={org.name}
                    className="flex items-center gap-0 border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors"
                  >
                    {/* Position */}
                    <div className="w-14 shrink-0 text-center py-4">
                      <span className={`text-lg font-black tabular-nums ${isTop3 ? "text-[#0a0a0a]" : "text-[#d4d4d4]"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Accent stripe */}
                    <div
                      className="w-1 self-stretch shrink-0 rounded-sm"
                      style={{ background: i === 0 ? "#e10600" : i < 3 ? "#0a0a0a" : "#f0f0f0" }}
                    />

                    {/* Org info */}
                    <div className="flex items-center gap-3 px-4 py-4 flex-1 min-w-0">
                      <img
                        src={`https://github.com/${org.name}.png`}
                        alt=""
                        className="w-8 h-8 rounded shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0a0a0a] truncate">{org.name}</p>
                        <p className="text-[10px] text-[#a3a3a3]">{org.drivers} driver{org.drivers !== 1 ? "s" : ""}</p>
                      </div>
                      {/* Member avatars */}
                      <div className="hidden sm:flex -space-x-2 ml-1">
                        {org.members.slice(0, 4).map((m, j) => (
                          <img
                            key={j}
                            src={m.avatar || `https://github.com/${m.username}.png`}
                            alt=""
                            className="w-5 h-5 rounded-full border-2 border-white"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Points bar */}
                    <div className="hidden md:flex items-center gap-3 w-48 shrink-0 pr-2">
                      <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            background: i === 0 ? "#e10600" : "#0a0a0a",
                          }}
                        />
                      </div>
                    </div>

                    {/* Points */}
                    <div className="w-20 shrink-0 text-right pr-4 py-4">
                      <p className={`text-lg font-black tabular-nums ${isTop3 ? "text-[#0a0a0a]" : "text-[#525252]"}`}>
                        {org.totalPoints}
                      </p>
                      <p className="text-[8px] uppercase tracking-wider text-[#a3a3a3]">Pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#a3a3a3] text-sm">No organizations yet.</p>
              <p className="text-[#525252] text-xs mt-1">Sign in and your GitHub orgs will appear here.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
