import Link from "next/link";

export default function RacePage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Race Day</h1>
        <p className="text-neutral-400 mb-6">
          Race results and live timeline coming soon. Check the dashboard for
          your current standings.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:border-neutral-500 transition-colors"
          >
            Standings
          </Link>
        </div>
      </div>
    </div>
  );
}
