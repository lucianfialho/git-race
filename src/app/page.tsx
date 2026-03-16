import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMostRelevantGP, getGPStatus, getNow } from "@/lib/f1/calendar";
import { GPHero } from "@/components/gp-hero";

export default async function HomePage() {
  const supabase = await createClient();
  const now = getNow();
  const nextGP = getMostRelevantGP(now);
  const gpStatus = nextGP ? getGPStatus(nextGP, now) : null;

  const { data: topDrivers } = await supabase
    .from("profiles")
    .select("github_username, avatar_url, total_points")
    .order("total_points", { ascending: false })
    .limit(5);

  const { count: driverCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get all profiles with github_stats to extract org leaderboard
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("github_username, avatar_url, total_points, github_stats")
    .order("total_points", { ascending: false });

  // Build org leaderboard: aggregate points by organization
  const orgMap = new Map<string, { name: string; totalPoints: number; drivers: number; topDriver: string; topAvatar: string }>();
  for (const p of allProfiles || []) {
    const orgs: string[] = (p.github_stats as Record<string, unknown>)?.organizations as string[] ?? [];
    for (const org of orgs) {
      const existing = orgMap.get(org);
      if (existing) {
        existing.totalPoints += p.total_points || 0;
        existing.drivers += 1;
      } else {
        orgMap.set(org, {
          name: org,
          totalPoints: p.total_points || 0,
          drivers: 1,
          topDriver: p.github_username,
          topAvatar: p.avatar_url || "",
        });
      }
    }
  }
  const topOrgs = Array.from(orgMap.values())
    .filter((o) => o.drivers >= 1)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* GP Hero — dark, immersive, themed per GP */}
      {nextGP && gpStatus && (
        <GPHero gp={nextGP} status={gpStatus} />
      )}

      {/* Fallback hero when no GP */}
      {!nextGP && (
        <section className="bg-[#0a0a0a] text-white">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.95]">
              Your GitHub.<br/>
              <span className="text-white/30">Your Race.</span>
            </h1>
            <p className="text-white/50 text-lg mt-6 max-w-lg">
              Commits power your engine. PRs shape your aero. Reviews grip your tires.
            </p>
            <div className="flex gap-3 mt-8">
              <Link href="/login" className="f1-btn f1-btn-accent rounded-sm">Start Racing</Link>
              <Link href="/calendar" className="px-5 py-2.5 text-sm font-bold uppercase tracking-wider border border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-sm transition-colors">Calendar</Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-[0.95] text-[#0a0a0a]">
            Code all week.<br/>Race on Sunday.
          </h2>
          <p className="text-[#525252] mt-4 leading-relaxed">
            GitRace transforms your GitHub contributions into F1 car performance.
            Qualify during the week, race on weekends, climb from F3 to F1.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <Link href="/login" className="f1-btn f1-btn-primary rounded-sm text-sm">
              Sign in with GitHub
            </Link>
            {driverCount !== null && driverCount > 0 && (
              <span className="text-[#a3a3a3] text-xs">{driverCount} developers racing</span>
            )}
          </div>
        </div>
      </section>

      {/* Car Spec Sheet */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3] mb-6">Car Specification</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 border border-[#e5e5e5] rounded-sm overflow-hidden">
            {[
              { comp: "Power Unit", source: "Commits", pct: 72 },
              { comp: "Aerodynamics", source: "Pull Requests", pct: 58 },
              { comp: "Reliability", source: "Daily Activity", pct: 85 },
              { comp: "Tire Mgmt", source: "Code Reviews", pct: 44 },
              { comp: "Strategy", source: "Issues", pct: 63 },
            ].map((c, i) => (
              <div key={c.comp} className={`p-4 ${i < 4 ? "border-b sm:border-b-0 sm:border-r border-[#e5e5e5]" : ""}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-bold text-[#0a0a0a]">{c.comp}</span>
                  <span className="text-xs text-[#a3a3a3] font-mono">{c.pct}</span>
                </div>
                <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#0a0a0a] rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#a3a3a3]">{c.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Race Weekend — timeline style */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-4">Race Weekend</p>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0a0a0a] mb-12">Three Sessions. One Winner.</h2>

          <div className="grid md:grid-cols-3 gap-0 border border-[#e5e5e5] rounded-sm overflow-hidden">
            {[
              {
                day: "MON–FRI",
                title: "Qualifying",
                desc: "Your GitHub contributions set your grid position. Q1, Q2, Q3 — bottom 5 eliminated each session.",
                accent: false,
              },
              {
                day: "SATURDAY",
                title: "Sprint",
                desc: "At 7 select GPs. Shorter race, quick points: 8-7-6-5-4-3-2-1 for the top 8 finishers.",
                accent: false,
              },
              {
                day: "SUNDAY",
                title: "Grand Prix",
                desc: "Full simulation — overtakes, pit stops, safety cars, rain. F1 points: 25 down to 1.",
                accent: true,
              },
            ].map((item, i) => (
              <div
                key={item.day}
                className={`p-6 md:p-8 ${i < 2 ? "border-b md:border-b-0 md:border-r border-[#e5e5e5]" : ""} ${item.accent ? "bg-[#0a0a0a] text-white" : ""}`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${item.accent ? "text-[#e10600]" : "text-[#a3a3a3]"}`}>
                  {item.day}
                </span>
                <h3 className={`text-xl font-bold uppercase tracking-tight mt-2 ${item.accent ? "text-white" : "text-[#0a0a0a]"}`}>
                  {item.title}
                </h3>
                <p className={`text-sm mt-3 leading-relaxed ${item.accent ? "text-white/50" : "text-[#525252]"}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Championship Leaders */}
      {topDrivers && topDrivers.length > 0 && (
        <section className="border-t border-[#e5e5e5]">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-20">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-2">Championship</p>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0a0a0a]">Standings</h2>
              </div>
              <Link href="/leaderboard" className="text-sm font-bold uppercase tracking-wider text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors">
                Full Table &rarr;
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
              {topDrivers.map((driver, i) => (
                <Link
                  key={driver.github_username}
                  href={`/driver/${driver.github_username}`}
                  className="flex-shrink-0 w-[180px] rounded-sm border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors group snap-start overflow-hidden"
                >
                  {/* Top accent bar */}
                  <div className="h-1" style={{ background: i === 0 ? "#e10600" : "#e5e5e5" }} />
                  <div className="p-4 text-center">
                    <span className={`text-xs font-bold uppercase tracking-[0.15em] ${i === 0 ? "text-[#e10600]" : "text-[#a3a3a3]"}`}>
                      P{i + 1}
                    </span>
                    <img
                      src={driver.avatar_url || `https://github.com/${driver.github_username}.png`}
                      alt=""
                      className="w-14 h-14 rounded-full mx-auto mt-3 group-hover:scale-105 transition-transform"
                    />
                    <p className="text-[#0a0a0a] font-bold text-sm mt-3 truncate">{driver.github_username}</p>
                    <p className="text-2xl font-black text-[#0a0a0a] mt-1 tabular-nums">
                      {driver.total_points}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Points</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Organizations */}
      {topOrgs.length > 0 && (
        <section className="border-t border-[#e5e5e5]">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-2">Constructors</p>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0a0a0a]">Organizations</h2>
              </div>
              <Link href="/leaderboard" className="text-sm font-bold uppercase tracking-wider text-[#a3a3a3] hover:text-[#0a0a0a] transition-colors">
                Full Table &rarr;
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
              {topOrgs.map((org, i) => (
                <div
                  key={org.name}
                  className="flex-shrink-0 w-[200px] rounded-sm border border-[#e5e5e5] overflow-hidden snap-start"
                >
                  <div className="h-1" style={{ background: i === 0 ? "#e10600" : "#e5e5e5" }} />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://github.com/${org.name}.png`}
                        alt=""
                        className="w-8 h-8 rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-[#0a0a0a] font-bold text-sm truncate">{org.name}</p>
                        <p className="text-[#a3a3a3] text-xs">{org.drivers} driver{org.drivers !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-[#0a0a0a] tabular-nums">
                      {org.totalPoints}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Combined Points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] py-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[#a3a3a3] text-xs font-bold uppercase tracking-[0.15em]">GitRace Manager</span>
          <div className="flex gap-6 text-[#a3a3a3] text-xs font-bold uppercase tracking-wider">
            <Link href="/calendar" className="hover:text-[#0a0a0a] transition-colors">Calendar</Link>
            <Link href="/leaderboard" className="hover:text-[#0a0a0a] transition-colors">Standings</Link>
            <Link href="/login" className="hover:text-[#0a0a0a] transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
