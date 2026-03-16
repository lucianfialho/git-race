import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGP, getNextGP, getGPStatus } from "@/lib/f1/calendar";
import { CountdownTimer } from "@/components/countdown-timer";

const COUNTRY_FLAGS: Record<string, string> = {
  AU: "\u{1F1E6}\u{1F1FA}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  BH: "\u{1F1E7}\u{1F1ED}", SA: "\u{1F1F8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}", MC: "\u{1F1F2}\u{1F1E8}", ES: "\u{1F1EA}\u{1F1F8}",
  CA: "\u{1F1E8}\u{1F1E6}", AT: "\u{1F1E6}\u{1F1F9}", GB: "\u{1F1EC}\u{1F1E7}",
  BE: "\u{1F1E7}\u{1F1EA}", HU: "\u{1F1ED}\u{1F1FA}", NL: "\u{1F1F3}\u{1F1F1}",
  AZ: "\u{1F1E6}\u{1F1FF}", SG: "\u{1F1F8}\u{1F1EC}", MX: "\u{1F1F2}\u{1F1FD}",
  BR: "\u{1F1E7}\u{1F1F7}", QA: "\u{1F1F6}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
};

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

  const isLive = gpStatus === "qualifying" || gpStatus === "sprint" || gpStatus === "race_day";
  const countdownTarget =
    gpStatus === "qualifying" ? nextGP?.dates.qualiEnd :
    gpStatus === "race_day" || gpStatus === "sprint" ? nextGP?.dates.raceDate :
    nextGP?.dates.qualiStart;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 md:pt-32 pb-20">
        <div className="max-w-2xl">
          <h1 className="f1-heading text-5xl md:text-7xl text-[#0a0a0a]">
            Your GitHub.<br/>Your Race.
          </h1>
          <p className="text-[#525252] text-lg mt-6 leading-relaxed max-w-lg">
            Commits power your engine. PRs shape your aero. Reviews grip your tires.
            Follow the real F1 calendar and compete with developers worldwide.
          </p>
          <div className="flex gap-3 mt-8">
            <Link href="/login" className="f1-btn f1-btn-primary rounded-lg">
              Start Racing
            </Link>
            <Link href="/calendar" className="f1-btn f1-btn-secondary rounded-lg">
              View Calendar
            </Link>
          </div>
          {driverCount !== null && driverCount > 0 && (
            <p className="text-[#a3a3a3] text-sm mt-6">{driverCount} developers racing this season</p>
          )}
        </div>
      </section>

      {/* Next GP */}
      {nextGP && (
        <section className="border-y border-[#e5e5e5]">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isLive && <span className="f1-tag f1-tag-live">Live</span>}
                  <span className="text-[#a3a3a3] text-xs font-semibold uppercase tracking-wider">
                    Round {nextGP.round}
                  </span>
                </div>
                <h2 className="f1-heading text-2xl md:text-3xl text-[#0a0a0a]">{nextGP.name}</h2>
                <p className="text-[#525252] text-sm mt-1">{nextGP.circuit}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">{COUNTRY_FLAGS[nextGP.countryCode] ?? ""}</span>
                  {nextGP.hasSprint && <span className="f1-tag f1-tag-neutral">Sprint</span>}
                </div>
              </div>
              <div className="text-left md:text-right">
                {countdownTarget && <CountdownTimer targetDate={countdownTarget} />}
                <Link
                  href={`/gp/${nextGP.slug}/qualifying`}
                  className="inline-block mt-3 text-sm font-semibold text-[#e10600] hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Car Components */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="f1-heading text-xl text-[#0a0a0a] mb-2">Build Your Car</h2>
        <p className="text-[#525252] text-sm mb-10 max-w-md">
          Your GitHub activity maps to 5 car components. Each contribution type improves a different part.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-px bg-[#e5e5e5] border border-[#e5e5e5] rounded-xl overflow-hidden">
          {[
            { name: "Power Unit", metric: "Commits", color: "#0a0a0a" },
            { name: "Aero", metric: "Pull Requests", color: "#0a0a0a" },
            { name: "Reliability", metric: "Daily Activity", color: "#0a0a0a" },
            { name: "Tire Mgmt", metric: "Code Reviews", color: "#0a0a0a" },
            { name: "Strategy", metric: "Issues", color: "#0a0a0a" },
          ].map((c) => (
            <div key={c.name} className="bg-white p-5">
              <h3 className="font-bold text-sm text-[#0a0a0a]">{c.name}</h3>
              <p className="text-[#a3a3a3] text-xs mt-1">{c.metric}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="f1-heading text-xl text-[#0a0a0a] mb-10">Race Weekend</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { day: "Mon — Fri", title: "Qualifying", desc: "Your GitHub contributions set your grid. Q1, Q2, Q3 sessions eliminate the slowest." },
              { day: "Saturday", title: "Sprint Race", desc: "At 7 select GPs. Shorter race, quick points: 8 down to 1 for the top 8 finishers." },
              { day: "Sunday", title: "Grand Prix", desc: "Full race with overtakes, pit stops, safety cars. Points: 25-18-15-12-10-8-6-4-2-1." },
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
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="f1-heading text-xl text-[#0a0a0a]">Championship</h2>
              <Link href="/leaderboard" className="text-sm font-semibold text-[#e10600] hover:underline">
                Full Standings
              </Link>
            </div>
            <div className="space-y-3">
              {topDrivers.map((driver, i) => (
                <Link
                  key={driver.github_username}
                  href={`/driver/${driver.github_username}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[#e5e5e5] hover:border-[#d4d4d4] transition-colors"
                >
                  <span className="f1-stat-number text-3xl w-12 text-[#0a0a0a]">{i + 1}</span>
                  <img
                    src={driver.avatar_url || `https://github.com/${driver.github_username}.png`}
                    alt={driver.github_username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#0a0a0a]">{driver.github_username}</p>
                  </div>
                  <span className="font-bold text-lg text-[#0a0a0a]">{driver.total_points}<span className="text-[#a3a3a3] text-xs ml-1 font-normal">pts</span></span>
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
