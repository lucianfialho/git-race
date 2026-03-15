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

  const statusText =
    gpStatus === "qualifying" ? "Qualifying Live" :
    gpStatus === "sprint" ? "Sprint Day" :
    gpStatus === "race_day" ? "Race Day" :
    "Next Race";

  const countdownTarget =
    gpStatus === "qualifying" ? nextGP?.dates.qualiEnd :
    gpStatus === "race_day" || gpStatus === "sprint" ? nextGP?.dates.raceDate :
    nextGP?.dates.qualiStart;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 md:pt-24 pb-16 text-center">
        {nextGP && (
          <div className="mb-10 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">{COUNTRY_FLAGS[nextGP.countryCode] ?? ""}</span>
              <span className="text-sm font-medium text-neutral-400">Round {nextGP.round}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "var(--gp-primary)" }}>
              {nextGP.name}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">{nextGP.circuit}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs uppercase tracking-wider text-neutral-400">{statusText}</span>
              {countdownTarget && <CountdownTimer targetDate={countdownTarget} />}
            </div>
            {nextGP.hasSprint && (
              <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Sprint Weekend
              </span>
            )}
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
          Your GitHub.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, var(--gp-primary), var(--gp-secondary))` }}>
            Your Race.
          </span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          Commits power your engine. PRs shape your aero. Reviews grip your tires.
          Follow the real F1 calendar — qualify during the week, race on weekends.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/login"
            className="font-semibold px-8 py-3 rounded-lg text-lg transition-colors text-white"
            style={{ background: "var(--gp-primary)" }}
          >
            Start Racing
          </Link>
          <Link
            href="/calendar"
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors border border-neutral-700"
          >
            View Calendar
          </Link>
        </div>

        {driverCount !== null && driverCount > 0 && (
          <p className="text-neutral-500 text-sm mt-6">
            {driverCount} developers racing this season
          </p>
        )}
      </section>

      {/* Car Components Explanation */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-4">Build Your Car</h2>
        <p className="text-neutral-400 text-center mb-12 max-w-xl mx-auto">
          Your GitHub activity maps to 5 car components. Each type of contribution improves a different part of your machine.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Power Unit", icon: "\u{26A1}", metric: "Commits", color: "#ef4444" },
            { name: "Aero", icon: "\u{1F4A8}", metric: "PRs", color: "#3b82f6" },
            { name: "Reliability", icon: "\u{1F6E1}\u{FE0F}", metric: "Daily Activity", color: "#22c55e" },
            { name: "Tire Mgmt", icon: "\u{1F6DE}", metric: "Code Reviews", color: "#a855f7" },
            { name: "Strategy", icon: "\u{1F9E0}", metric: "Issues", color: "#f59e0b" },
          ].map((c) => (
            <div key={c.name} className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 text-center">
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="font-bold text-sm" style={{ color: c.color }}>{c.name}</h3>
              <p className="text-neutral-500 text-xs mt-1">{c.metric}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Race Weekend</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "Mon-Fri", title: "Qualifying", desc: "Your GitHub activity during the week determines your grid position. Q1, Q2, Q3 — bottom 5 eliminated each session." },
            { step: "Sat", title: "Sprint (select GPs)", desc: "Sprint races at 7 GPs. Shorter race, quick points: 8-7-6-5-4-3-2-1 for the top 8." },
            { step: "Sun", title: "Race Day", desc: "Full race simulation with overtakes, pit stops, safety cars, and rain. F1 points: 25-18-15-12-10-8-6-4-2-1." },
          ].map((item) => (
            <div key={item.step} className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <span className="font-mono text-xs font-bold" style={{ color: "var(--gp-primary)" }}>{item.step}</span>
              <h3 className="text-white font-bold text-lg mt-2">{item.title}</h3>
              <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Drivers */}
      {topDrivers && topDrivers.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">Championship Leaders</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {topDrivers.map((driver, i) => (
              <Link
                key={driver.github_username}
                href={`/driver/${driver.github_username}`}
                className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 flex items-center gap-4 hover:bg-neutral-800/80 transition-colors min-w-[200px]"
              >
                <span className="text-2xl font-black text-neutral-600">P{i + 1}</span>
                <img
                  src={driver.avatar_url || `https://github.com/${driver.github_username}.png`}
                  alt={driver.github_username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-white text-sm font-medium">{driver.github_username}</p>
                  <p className="text-neutral-500 text-xs">{driver.total_points} pts</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/leaderboard" className="text-sm hover:underline" style={{ color: "var(--gp-primary)" }}>
              View Full Standings
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-neutral-500 text-sm">GitRace Manager</span>
          <div className="flex gap-6 text-neutral-500 text-sm">
            <Link href="/calendar" className="hover:text-white">Calendar</Link>
            <Link href="/leaderboard" className="hover:text-white">Standings</Link>
            <Link href="/login" className="hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
