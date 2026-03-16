import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { getCurrentGP, getNextGP, getGPStatus, getNow } from "@/lib/f1/calendar";
import { detectRivals } from "@/lib/race/rivalries";
import type { StandingEntry } from "@/lib/race/rivalries";
import { getDivisionFromPoints } from "@/lib/race/divisions";

export const metadata = {
  title: "Dashboard - GitRace Manager",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get latest activity snapshot
  const { data: latestSnapshot } = await supabase
    .from("activity_snapshots")
    .select("*")
    .eq("profile_id", profile.id)
    .order("period_start", { ascending: false })
    .limit(1)
    .single();

  // GP info
  const now = getNow();
  const currentGP = getCurrentGP(now) ?? getNextGP(now);
  const gpStatus = currentGP ? getGPStatus(currentGP, now) : null;

  // Fetch all profiles for rivalry detection
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, github_username, avatar_url, total_points")
    .order("total_points", { ascending: false });

  const standings: StandingEntry[] = (allProfiles ?? []).map((p, i) => ({
    profileId: p.id,
    name: p.github_username,
    points: p.total_points ?? 0,
    position: i + 1,
    isBot: false,
  }));

  const rivalIds = detectRivals(profile.id, standings);
  const rivals = rivalIds
    .map((id) => {
      const entry = standings.find((s) => s.profileId === id);
      const prof = allProfiles?.find((p) => p.id === id);
      if (!entry || !prof) return null;
      const myEntry = standings.find((s) => s.profileId === profile.id);
      const diff = (myEntry?.points ?? 0) - entry.points;
      return {
        id: prof.id,
        username: prof.github_username,
        avatar_url: prof.avatar_url,
        points: entry.points,
        position: entry.position,
        pointsDiff: diff,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    username: string;
    avatar_url: string | null;
    points: number;
    position: number;
    pointsDiff: number;
  }>;

  // Division from points
  const division = getDivisionFromPoints(profile.total_points ?? 0);

  // Parse car_stats safely
  const carStats = profile.car_stats ?? {
    power_unit: 0,
    aero: 0,
    reliability: 0,
    tire_mgmt: 0,
    strategy: 0,
  };

  return (
    <DashboardClient
      profile={{
        id: profile.id,
        github_username: profile.github_username,
        avatar_url: profile.avatar_url,
        car_color: profile.car_color,
        car_number: profile.car_number,
        total_points: profile.total_points,
        car_stats: carStats,
        github_stats: profile.github_stats ?? null,
        division: division.name,
        divisionLevel: division.level,
      }}
      rivals={rivals}
      latestSnapshot={latestSnapshot}
      currentGP={currentGP ? {
        name: currentGP.name,
        slug: currentGP.slug,
        circuit: currentGP.circuit,
        countryCode: currentGP.countryCode,
        status: gpStatus ?? "upcoming",
        qualiEnd: currentGP.dates.qualiEnd,
        raceDate: currentGP.dates.raceDate,
        hasSprint: currentGP.hasSprint,
      } : null}
    />
  );
}
