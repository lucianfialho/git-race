import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, string> = {
  race: "Race",
  qualifying: "Qualifying",
  contribution: "Contribution",
  season: "Season",
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all achievements from DB
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("category");

  // Fetch user's unlocked achievements
  let unlockedSlugs: Set<string> = new Set();
  if (user) {
    const { data: unlocked } = await supabase
      .from("profile_achievements")
      .select("achievement_id, achievements(slug)")
      .eq("profile_id", user.id);

    if (unlocked) {
      for (const u of unlocked) {
        const ach = u.achievements as unknown as { slug: string } | null;
        if (ach?.slug) unlockedSlugs.add(ach.slug);
      }
    }
  }

  // Fallback to hardcoded list if DB has no achievements (migration not run)
  const achievementList = (achievements && achievements.length > 0) ? achievements : [
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

  const categories = [...new Set(achievementList.map((a) => a.category))];
  const totalUnlocked = unlockedSlugs.size;
  const totalAchievements = achievementList.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="f1-heading text-3xl text-[#0a0a0a]">Achievements</h1>
          {user && (
            <span className="text-sm font-bold text-[#0a0a0a]">
              {totalUnlocked}<span className="text-[#a3a3a3] font-normal">/{totalAchievements}</span>
            </span>
          )}
        </div>
        <p className="text-[#a3a3a3] text-sm mb-8">
          {user ? "Unlock badges by racing and contributing" : "Sign in to track your progress"}
        </p>

        {/* Progress bar */}
        {user && (
          <div className="mb-8">
            <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0a0a0a] rounded-full transition-all"
                style={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
              />
            </div>
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-[0.15em] mb-3">
              {CATEGORIES[cat] ?? cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {achievementList.filter((a) => a.category === cat).map((a) => {
                const isUnlocked = unlockedSlugs.has(a.slug);
                return (
                  <div
                    key={a.slug}
                    className={`flex items-center gap-3 p-4 rounded-sm border transition-colors ${
                      isUnlocked
                        ? "border-[#0a0a0a] bg-[#fafafa]"
                        : "border-[#e5e5e5]"
                    }`}
                  >
                    <span className={`text-2xl ${isUnlocked ? "" : "grayscale opacity-40"}`}>{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-[#0a0a0a] text-sm font-bold">{a.name}</p>
                      <p className="text-[#a3a3a3] text-xs">{a.description}</p>
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]">Unlocked</span>
                    ) : (
                      <span className="text-[#d4d4d4] text-xs font-medium">Locked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
