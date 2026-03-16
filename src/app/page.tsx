import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGP, getNextGP, getGPStatus } from "@/lib/f1/calendar";
import { GPHero } from "@/components/gp-hero";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date();
  const currentGP = getCurrentGP(now);
  const nextGP = currentGP ?? getNextGP(now);
  const gpStatus = nextGP ? getGPStatus(nextGP, now) : null;

  const { data: topDrivers } = await supabase
    .from("profiles")
    .select("github_username, avatar_url, total_points")
    .order("total_points", { ascending: false })
    .limit(3);

  const { count: driverCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-white">
      {/* GP Hero — themed per current/next race */}
      {nextGP && gpStatus && (
        <GPHero gp={nextGP} status={gpStatus} />
      )}

      {/* Tagline — only when no GP to show */}
      {!nextGP && (
        <section className="max-w-4xl mx-auto px-4 pt-20 md:pt-32 pb-16">
          <h1 className="f1-heading text-5xl md:text-7xl text-[#0a0a0a]">
            Your GitHub.<br/>Your Race.
          </h1>
          <p className="text-[#525252] text-lg mt-6 leading-relaxed max-w-lg">
            Commits power your engine. PRs shape your aero. Reviews grip your tires.
            Follow the real F1 calendar and compete with developers worldwide.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/login" className="f1-btn f1-btn-primary rounded-lg">Start Racing</Link>
            <Link href="/calendar" className="f1-btn f1-btn-secondary rounded-lg">View Calendar</Link>
          </div>
        </section>
      )}

      {/* Pitch section — concise, below hero */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            <div className="flex-1">
              <h2 className="f1-heading text-xl text-[#0a0a0a] mb-3">
                Your GitHub.<br/>Your Race.
              </h2>
              <p className="text-[#525252] text-sm leading-relaxed">
                GitRace transforms your GitHub contributions into F1 performance.
                Qualify during the week, race on weekends, climb from F3 to F1.
              </p>
              <div className="flex gap-3 mt-6">
                <Link href="/login" className="f1-btn f1-btn-primary rounded-lg text-sm">
                  Sign in with GitHub
                </Link>
              </div>
              {driverCount !== null && driverCount > 0 && (
                <p className="text-[#a3a3a3] text-xs mt-4">{driverCount} developers racing this season</p>
              )}
            </div>

            {/* Car components mini */}
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a3a3a3] mb-4">Your Car</h3>
              <div className="space-y-3">
                {[
                  { comp: "Power Unit", source: "Commits" },
                  { comp: "Aerodynamics", source: "Pull Requests" },
                  { comp: "Reliability", source: "Daily Activity" },
                  { comp: "Tire Management", source: "Code Reviews" },
                  { comp: "Strategy", source: "Issues" },
                ].map((c) => (
                  <div key={c.comp} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0a0a0a]">{c.comp}</span>
                    <span className="text-xs text-[#a3a3a3]">{c.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Race Weekend */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="f1-heading text-xl text-[#0a0a0a] mb-10">Race Weekend</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { day: "Mon — Fri", title: "Qualifying", desc: "Your contributions set your grid. Q1, Q2, Q3 sessions eliminate the bottom 5 each." },
              { day: "Saturday", title: "Sprint Race", desc: "At 7 select GPs. Shorter race, quick points: 8-7-6-5-4-3-2-1 for the top 8." },
              { day: "Sunday", title: "Grand Prix", desc: "Full simulation with overtakes, pit stops, safety cars, rain. F1 points system." },
            ].map((item) => (
              <div key={item.day}>
                <span className="text-[#e10600] text-xs font-bold uppercase tracking-wider">{item.day}</span>
                <h3 className="font-bold text-lg text-[#0a0a0a] mt-2">{item.title}</h3>
                <p className="text-[#525252] text-sm mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Championship Leaders */}
      {topDrivers && topDrivers.length > 0 && (
        <section className="border-t border-[#e5e5e5]">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="f1-heading text-xl text-[#0a0a0a]">Championship</h2>
              <Link href="/leaderboard" className="text-sm font-semibold text-[#e10600] hover:underline">
                Full Standings
              </Link>
            </div>
            <div className="space-y-2">
              {topDrivers.map((driver, i) => (
                <Link
                  key={driver.github_username}
                  href={`/driver/${driver.github_username}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors"
                >
                  <span className="text-2xl font-black text-[#0a0a0a] w-8">{i + 1}</span>
                  <img
                    src={driver.avatar_url || `https://github.com/${driver.github_username}.png`}
                    alt={driver.github_username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#0a0a0a]">{driver.github_username}</p>
                  </div>
                  <span className="font-bold text-lg text-[#0a0a0a]">
                    {driver.total_points}
                    <span className="text-[#a3a3a3] text-xs ml-1 font-normal">pts</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[#a3a3a3] text-sm">GitRace Manager</span>
          <div className="flex gap-6 text-[#525252] text-sm">
            <Link href="/calendar" className="hover:text-[#0a0a0a]">Calendar</Link>
            <Link href="/leaderboard" className="hover:text-[#0a0a0a]">Standings</Link>
            <Link href="/login" className="hover:text-[#0a0a0a]">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
