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
  members: string[];
}

export function LeaderboardTabs({ drivers, orgs }: { drivers: Driver[]; orgs: Org[] }) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");

  const top3 = drivers.slice(0, 3);

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border border-[#e5e5e5] rounded-sm p-1 w-fit">
        <button
          onClick={() => setTab("drivers")}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors ${
            tab === "drivers" ? "bg-[#0a0a0a] text-white" : "text-[#a3a3a3] hover:text-[#0a0a0a]"
          }`}
        >
          Drivers
        </button>
        <button
          onClick={() => setTab("constructors")}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors ${
            tab === "constructors" ? "bg-[#0a0a0a] text-white" : "text-[#a3a3a3] hover:text-[#0a0a0a]"
          }`}
        >
          Constructors
        </button>
      </div>

      {tab === "drivers" && (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-6 mb-10 pt-4">
              {[
                { entry: top3[1], pos: "P2", h: "h-24", order: 1 },
                { entry: top3[0], pos: "P1", h: "h-32", order: 2 },
                { entry: top3[2], pos: "P3", h: "h-16", order: 3 },
              ].map(({ entry, pos, h, order }) => (
                <Link
                  key={pos}
                  href={`/driver/${entry.username}`}
                  className="flex flex-col items-center group"
                  style={{ order }}
                >
                  <img
                    src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                    alt=""
                    className="w-12 h-12 rounded-full mb-1 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[#0a0a0a] text-sm font-bold">{entry.username}</span>
                  <span className="text-[#a3a3a3] text-xs">{entry.totalPoints} pts</span>
                  <span className="text-xs font-bold text-[#a3a3a3] mt-1">{pos}</span>
                  <div className={`w-20 ${h} rounded-t-lg mt-1 ${pos === "P1" ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]"}`} />
                </Link>
              ))}
            </div>
          )}

          {/* Driver Table */}
          <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
            {drivers.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-[#a3a3a3] text-[10px] uppercase tracking-[0.15em]">
                    <th className="text-left py-3 px-4 w-12 font-semibold">Pos</th>
                    <th className="text-left py-3 px-4 font-semibold">Driver</th>
                    <th className="text-right py-3 px-4 w-20 font-semibold">Points</th>
                    <th className="text-right py-3 px-4 w-16 font-semibold hidden sm:table-cell">Wins</th>
                    <th className="text-right py-3 px-4 w-20 font-semibold hidden sm:table-cell">Podiums</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((entry) => (
                    <tr key={entry.profileId} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                      <td className="py-3 px-4">
                        <span className={`font-black ${entry.position <= 3 ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                          {entry.position}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/driver/${entry.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-1 h-6 rounded-full" style={{ background: entry.position === 1 ? "#e10600" : "#e5e5e5" }} />
                          <img src={entry.avatarUrl || `https://github.com/${entry.username}.png`} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <span className="text-[#0a0a0a] font-bold text-sm">{entry.username}</span>
                            <span className="text-[#a3a3a3] font-mono text-xs ml-2">#{entry.carNumber}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[#0a0a0a] font-bold tabular-nums">{entry.totalPoints}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#525252] hidden sm:table-cell">{entry.wins}</td>
                      <td className="py-3 px-4 text-right text-[#525252] hidden sm:table-cell">{entry.podiums}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-[#a3a3a3]">
                No drivers yet.{" "}
                <Link href="/login" className="text-[#e10600] font-semibold hover:underline">Be the first!</Link>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "constructors" && (
        <div className="rounded-sm border border-[#e5e5e5] overflow-hidden">
          {orgs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[#a3a3a3] text-[10px] uppercase tracking-[0.15em]">
                  <th className="text-left py-3 px-4 w-12 font-semibold">Pos</th>
                  <th className="text-left py-3 px-4 font-semibold">Organization</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold">Points</th>
                  <th className="text-right py-3 px-4 w-20 font-semibold hidden sm:table-cell">Drivers</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org, i) => (
                  <tr key={org.name} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-black ${i < 3 ? "text-[#0a0a0a]" : "text-[#a3a3a3]"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full" style={{ background: i === 0 ? "#e10600" : "#e5e5e5" }} />
                        <img
                          src={`https://github.com/${org.name}.png`}
                          alt=""
                          className="w-8 h-8 rounded"
                        />
                        <div>
                          <span className="text-[#0a0a0a] font-bold text-sm">{org.name}</span>
                        </div>
                        {/* Member avatars */}
                        <div className="flex -space-x-1.5 ml-2">
                          {org.members.slice(0, 3).map((avatar, j) => (
                            <img key={j} src={avatar || ""} alt="" className="w-5 h-5 rounded-full border border-white" />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#0a0a0a] font-bold tabular-nums">{org.totalPoints}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#525252] hidden sm:table-cell">{org.drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-[#a3a3a3]">
              No organizations yet. Sign in and your GitHub orgs will appear here.
            </div>
          )}
        </div>
      )}
    </>
  );
}
