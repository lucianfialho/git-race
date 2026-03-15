const ACHIEVEMENTS = [
  { slug: "pole_position", name: "Pole Position", description: "Qualify P1 for a Grand Prix", icon: "\u{1F3C1}", category: "qualifying" },
  { slug: "race_winner", name: "Race Winner", description: "Win a Grand Prix", icon: "\u{1F3C6}", category: "race" },
  { slug: "podium", name: "Podium Finish", description: "Finish in the top 3", icon: "\u{1F947}", category: "race" },
  { slug: "comeback_king", name: "Comeback King", description: "Gain 5+ positions during a race", icon: "\u{1F525}", category: "race" },
  { slug: "consistency_is_key", name: "Consistency is Key", description: "Contribute every day of a GP week", icon: "\u{1F4CA}", category: "contribution" },
  { slug: "rain_master", name: "Rain Master", description: "Win a race that had rain", icon: "\u{1F327}\u{FE0F}", category: "race" },
  { slug: "senna", name: "Senna", description: "Take 3 consecutive pole positions", icon: "\u{1F49B}", category: "qualifying" },
  { slug: "the_professor", name: "The Professor", description: "Complete 50+ code reviews in a season", icon: "\u{1F393}", category: "contribution" },
  { slug: "first_points", name: "Points!", description: "Score your first championship points", icon: "\u{2728}", category: "race" },
  { slug: "first_win", name: "First Victory", description: "Win your first ever race", icon: "\u{1F389}", category: "race" },
  { slug: "hat_trick", name: "Hat Trick", description: "Pole, win, and fastest lap in same GP", icon: "\u{1F3A9}", category: "race" },
  { slug: "grand_chelem", name: "Grand Chelem", description: "Pole, win, fastest lap, and lead every lap", icon: "\u{1F451}", category: "race" },
  { slug: "promotion", name: "Moving Up", description: "Get promoted to a higher division", icon: "\u{1F4C8}", category: "season" },
  { slug: "f1_champion", name: "F1 Champion", description: "Win the F1 division championship", icon: "\u{1F3C5}", category: "season" },
  { slug: "sprint_king", name: "Sprint King", description: "Win 3 sprint races in a season", icon: "\u{26A1}", category: "race" },
];

const CATEGORY_LABELS: Record<string, string> = {
  race: "Race",
  qualifying: "Qualifying",
  contribution: "Contribution",
  season: "Season",
};

export default function AchievementsPage() {
  const categories = [...new Set(ACHIEVEMENTS.map((a) => a.category))];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-2">Achievements</h1>
        <p className="text-neutral-400 mb-8">Unlock badges by racing and contributing</p>

        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.filter((a) => a.category === cat).map((achievement) => (
                <div
                  key={achievement.slug}
                  className="flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900 opacity-60"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{achievement.name}</p>
                    <p className="text-neutral-500 text-xs">{achievement.description}</p>
                  </div>
                  <span className="ml-auto text-neutral-700 text-xs">Locked</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-neutral-600 text-xs text-center mt-4">
          Sign in to track your achievement progress
        </p>
      </div>
    </div>
  );
}
