import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, { label: string; description: string }> = {
  race: { label: "Race", description: "Earned on race day" },
  qualifying: { label: "Qualifying", description: "Earned during qualifying sessions" },
  contribution: { label: "Contribution", description: "Earned through GitHub activity" },
  season: { label: "Season", description: "Earned across a full championship" },
};

const ACHIEVEMENT_LIST = [
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

export default async function AchievementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: achievements } = await supabase.from("achievements").select("*").order("category");

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

  const achievementList = (achievements && achievements.length > 0) ? achievements : ACHIEVEMENT_LIST;
  const categories = [...new Set(achievementList.map((a) => a.category))];
  const totalUnlocked = unlockedSlugs.size;
  const totalAchievements = achievementList.length;
  const progressPct = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Dark hero */}
      <section className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#e10600]" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e10600] mb-2">Collection</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                Achievements
              </h1>
              <p className="text-white/30 text-sm mt-2">
                {user ? "Unlock badges by racing and contributing" : "Sign in to start collecting"}
              </p>
            </div>

            {/* Progress circle */}
            {user && (
              <div className="text-center shrink-0">
                <p className="text-4xl font-black text-white tabular-nums leading-none">
                  {totalUnlocked}<span className="text-white/30 text-lg">/{totalAchievements}</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">Unlocked</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {user && (
            <div className="mt-6">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#e10600] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Achievement grid */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {categories.map((cat) => {
          const catInfo = CATEGORIES[cat] ?? { label: cat, description: "" };
          const catAchievements = achievementList.filter((a) => a.category === cat);
          const catUnlocked = catAchievements.filter((a) => unlockedSlugs.has(a.slug)).length;

          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">{catInfo.label}</h2>
                </div>
                {user && (
                  <span className="text-[10px] font-bold text-[#a3a3a3] tabular-nums">
                    {catUnlocked}/{catAchievements.length}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catAchievements.map((a) => {
                  const isUnlocked = unlockedSlugs.has(a.slug);

                  return (
                    <div
                      key={a.slug}
                      className={`relative overflow-hidden border rounded-sm transition-all ${
                        isUnlocked
                          ? "border-[#0a0a0a]"
                          : "border-[#e5e5e5]"
                      }`}
                    >
                      {/* Top accent for unlocked */}
                      {isUnlocked && <div className="h-0.5 bg-[#e10600]" />}

                      <div className="p-4 flex items-start gap-3">
                        <span className={`text-3xl ${isUnlocked ? "" : "grayscale opacity-30"}`}>{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${isUnlocked ? "text-[#0a0a0a]" : "text-[#525252]"}`}>{a.name}</p>
                          <p className="text-[#a3a3a3] text-xs mt-0.5 leading-relaxed">{a.description}</p>
                          {isUnlocked && (
                            <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#e10600]">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!user && (
          <div className="text-center py-8">
            <Link href="/login" className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] bg-[#0a0a0a] text-white rounded-sm hover:bg-[#262626] transition-colors">
              Sign in to start collecting
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
