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

      {/* How it works — editorial grid */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Left: pitch */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-4">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-[0.95] text-[#0a0a0a]">
              Code all week.<br/>Race on Sunday.
            </h2>
            <p className="text-[#525252] mt-4 leading-relaxed">
              GitRace transforms your GitHub contributions into F1 car performance.
              Qualify during the week, race on weekends, climb from F3 to F1.
            </p>
            <Link href="/login" className="f1-btn f1-btn-primary rounded-sm mt-6 text-sm">
              Sign in with GitHub
            </Link>
            {driverCount !== null && driverCount > 0 && (
              <p className="text-[#a3a3a3] text-xs mt-3">{driverCount} developers racing this season</p>
            )}
          </div>

          {/* Right: car spec sheet */}
          <div className="border border-[#e5e5e5] rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">Car Specification</p>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {[
                { comp: "Power Unit", source: "Commits", pct: 72 },
                { comp: "Aerodynamics", source: "Pull Requests", pct: 58 },
                { comp: "Reliability", source: "Daily Activity", pct: 85 },
                { comp: "Tire Management", source: "Code Reviews", pct: 44 },
                { comp: "Strategy", source: "Issues", pct: 63 },
              ].map((c) => (
                <div key={c.comp} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm font-bold text-[#0a0a0a]">{c.comp}</span>
                      <span className="text-xs text-[#a3a3a3] font-mono">{c.pct}</span>
                    </div>
                    <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0a0a0a] rounded-full transition-all duration-1000" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#a3a3a3] w-20 text-right shrink-0">{c.source}</span>
                </div>
              ))}
            </div>
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

            <div className="border border-[#e5e5e5] rounded-sm overflow-hidden divide-y divide-[#f0f0f0]">
              {topDrivers.map((driver, i) => (
                <Link
                  key={driver.github_username}
                  href={`/driver/${driver.github_username}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group"
                >
                  <span className={`text-2xl font-black w-8 tabular-nums ${i === 0 ? "text-[#0a0a0a]" : "text-[#d4d4d4]"}`}>
                    {i + 1}
                  </span>
                  <div className="w-1 h-8 rounded-full bg-[#0a0a0a]" style={i === 0 ? { background: "#e10600" } : undefined} />
                  <img
                    src={driver.avatar_url || `https://github.com/${driver.github_username}.png`}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                  <span className="text-[#0a0a0a] font-bold text-sm group-hover:underline">{driver.github_username}</span>
                  <span className="ml-auto font-bold text-lg tabular-nums text-[#0a0a0a]">
                    {driver.total_points}
                    <span className="text-[#a3a3a3] text-xs ml-1 font-normal">PTS</span>
                  </span>
                </Link>
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
