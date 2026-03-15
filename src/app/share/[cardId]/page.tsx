import { createClient } from "@/lib/supabase/server";
import { ShareCard } from "@/components/driver/share-card";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gitrace.dev";

  return {
    title: "Race Result - GitRace",
    openGraph: {
      title: "Check out my GitRace result!",
      description: "See how I performed in the GitHub developer racing championship.",
      images: [`${appUrl}/share/${cardId}/og`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${appUrl}/share/${cardId}/og`],
    },
  };
}

export default async function ShareCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("share_cards")
    .select("*, profiles(*), races(*)")
    .eq("id", cardId)
    .single();

  if (!card) notFound();

  const profile = card.profiles as unknown as {
    github_username: string;
    avatar_url: string;
    car_color: string;
    car_number: number;
  };

  const race = card.races as unknown as { name: string } | null;
  const meta = (card.metadata || {}) as {
    position?: number;
    points?: number;
    speed?: number;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4">
      <ShareCard
        username={profile.github_username}
        avatarUrl={profile.avatar_url || ""}
        carColor={profile.car_color || "#ff0000"}
        carNumber={profile.car_number || 0}
        position={meta.position || 0}
        points={meta.points || 0}
        raceName={race?.name || "GitRace"}
        speed={meta.speed || 0}
      />
      <div className="mt-8 flex gap-4">
        <a
          href={`/driver/${profile.github_username}`}
          className="text-neutral-400 text-sm hover:text-white transition-colors"
        >
          View Driver Profile
        </a>
        <a
          href="/login"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Join GitRace
        </a>
      </div>
    </div>
  );
}
