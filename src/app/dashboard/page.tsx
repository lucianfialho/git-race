import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { getCurrentGP, getNextGP, getGPStatus, getNow } from "@/lib/f1/calendar";

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
      }}
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
