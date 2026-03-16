import Link from "next/link";

export default function RacePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="f1-heading text-3xl text-[#0a0a0a] mb-4">Race Day</h1>
        <p className="text-[#525252] mb-6">
          Race results and live timeline coming soon.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="f1-btn f1-btn-primary rounded-lg text-sm">Dashboard</Link>
          <Link href="/leaderboard" className="f1-btn f1-btn-secondary rounded-lg text-sm">Standings</Link>
        </div>
      </div>
    </div>
  );
}
