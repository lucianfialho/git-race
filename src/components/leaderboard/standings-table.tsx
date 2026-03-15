"use client";

interface StandingsEntry {
  profileId: string;
  username: string;
  avatarUrl: string;
  carColor: string;
  carNumber: number;
  totalPoints: number;
  position: number;
  raceResults: Array<{ position: number; points: number }>;
}

interface StandingsTableProps {
  entries: StandingsEntry[];
}

export function StandingsTable({ entries }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4 w-12">Pos</th>
            <th className="text-left py-3 px-4">Driver</th>
            <th className="text-right py-3 px-4 w-16">Car</th>
            <th className="text-right py-3 px-4 w-20">Points</th>
            <th className="text-right py-3 px-4 w-20">Wins</th>
            <th className="text-right py-3 px-4 w-20">Podiums</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const wins = entry.raceResults.filter(
              (r) => r.position === 1
            ).length;
            const podiums = entry.raceResults.filter(
              (r) => r.position <= 3
            ).length;

            return (
              <tr
                key={entry.profileId}
                className="border-b border-neutral-800/50 hover:bg-neutral-900/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span
                    className={`font-bold ${
                      i === 0
                        ? "text-yellow-400"
                        : i === 1
                          ? "text-neutral-300"
                          : i === 2
                            ? "text-amber-600"
                            : "text-neutral-500"
                    }`}
                  >
                    {entry.position}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: entry.carColor }}
                    />
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-800" />
                    )}
                    <a
                      href={`/driver/${entry.username}`}
                      className="text-white font-medium hover:text-red-400 transition-colors"
                    >
                      {entry.username}
                    </a>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-neutral-400 font-mono text-sm">
                    #{entry.carNumber}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-white font-bold">
                    {entry.totalPoints}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-neutral-400">
                  {wins}
                </td>
                <td className="py-3 px-4 text-right text-neutral-400">
                  {podiums}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
