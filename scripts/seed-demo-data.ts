/**
 * Seed script for demo data.
 * Run: npx tsx scripts/seed-demo-data.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const DEMO_DRIVERS = [
  { username: "torvalds", color: "#ff0000", ghId: 1024025 },
  { username: "gaearon", color: "#61dafb", ghId: 810438 },
  { username: "sindresorhus", color: "#ffcc00", ghId: 170270 },
  { username: "tj", color: "#00cc00", ghId: 25254 },
  { username: "yyx990803", color: "#42b883", ghId: 499550 },
  { username: "getify", color: "#f7df1e", ghId: 150330 },
  { username: "ThePrimeagen", color: "#9900ff", ghId: 4458174 },
  { username: "kentcdodds", color: "#0066ff", ghId: 1500684 },
  { username: "wesbos", color: "#ff6600", ghId: 176013 },
  { username: "addyosmani", color: "#ff3366", ghId: 110953 },
  { username: "antfu", color: "#00cccc", ghId: 11247099 },
  { username: "rauchg", color: "#ffffff", ghId: 13041 },
  { username: "shadcn", color: "#333333", ghId: 124599 },
  { username: "tiangolo", color: "#009688", ghId: 1326112 },
  { username: "mdo", color: "#7952b3", ghId: 98681 },
  { username: "developit", color: "#673ab8", ghId: 105127 },
  { username: "Rich-Harris", color: "#ff3e00", ghId: 1162160 },
  { username: "pilcrowonpaper", color: "#e91e63", ghId: 75605231 },
  { username: "thdxr", color: "#f59e0b", ghId: 1615877 },
  { username: "sharkdp", color: "#3b82f6", ghId: 4209276 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log("Seeding demo data...\n");

  // 1. Create profiles
  console.log("Creating profiles...");
  const profiles = [];
  for (let i = 0; i < DEMO_DRIVERS.length; i++) {
    const driver = DEMO_DRIVERS[i];
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          github_id: driver.ghId,
          github_username: driver.username,
          avatar_url: `https://github.com/${driver.username}.png`,
          car_color: driver.color,
          car_number: i + 1,
          total_points: 0,
        },
        { onConflict: "github_id" }
      )
      .select()
      .single();

    if (error) {
      console.error(`  Failed ${driver.username}:`, error.message);
    } else {
      profiles.push(data);
      console.log(`  Created ${driver.username} (#${i + 1})`);
    }
  }

  // 2. Create season
  console.log("\nCreating season...");
  const year = new Date().getFullYear();
  const { data: season } = await supabase
    .from("seasons")
    .upsert(
      {
        name: `Season ${year}`,
        slug: `season-${year}`,
        start_date: `${year}-01-01`,
        end_date: `${year}-12-31`,
        is_active: true,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (!season) {
    console.error("Failed to create season");
    return;
  }
  console.log(`  Created ${season.name}`);

  // 3. Create current week race
  console.log("\nCreating race...");
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const raceStart = new Date(now);
  raceStart.setUTCDate(now.getUTCDate() + diffToMonday);
  raceStart.setUTCHours(0, 0, 0, 0);

  const raceEnd = new Date(raceStart);
  raceEnd.setUTCDate(raceStart.getUTCDate() + 6);
  raceEnd.setUTCHours(23, 59, 59, 999);

  const { data: race } = await supabase
    .from("races")
    .upsert(
      {
        season_id: season.id,
        name: "Race 1: Interlagos",
        slug: `${season.slug}-r1-interlagos`,
        race_number: 1,
        period_start: raceStart.toISOString(),
        period_end: raceEnd.toISOString(),
        status: "active",
        track_config: { name: "Interlagos" },
      },
      { onConflict: "season_id,race_number" }
    )
    .select()
    .single();

  if (!race) {
    console.error("Failed to create race");
    return;
  }
  console.log(`  Created ${race.name}`);

  // 4. Create activity snapshots and race entries
  console.log("\nCreating activity & race entries...");

  const periodStart = raceStart.toISOString().split("T")[0];
  const periodEnd = raceEnd.toISOString().split("T")[0];

  // Sort by random speed for variety
  const shuffled = [...profiles].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    const profile = shuffled[i];
    const isDNF = i >= shuffled.length - 2; // Last 2 are DNF

    const commits = isDNF ? 0 : randomInt(5, 200);
    const prsOpened = isDNF ? 0 : randomInt(0, 15);
    const prsMerged = isDNF ? 0 : randomInt(0, prsOpened);
    const prsReviewed = isDNF ? 0 : randomInt(0, 10);
    const issuesOpened = isDNF ? 0 : randomInt(0, 8);
    const issuesClosed = isDNF ? 0 : randomInt(0, issuesOpened);
    const linesAdded = isDNF ? 0 : randomInt(100, 5000);
    const linesDeleted = isDNF ? 0 : randomInt(50, 2000);
    const reposContributed = isDNF ? 0 : randomInt(1, 8);

    // Calculate speed using same formula as engine
    const rawScore =
      prsMerged * 8 +
      reposContributed * 6 +
      prsOpened * 5 +
      prsReviewed * 4 +
      commits * 3 +
      issuesClosed * 3 +
      issuesOpened * 2 +
      linesAdded * 0.01 +
      linesDeleted * 0.005;

    const speed = isDNF ? 0 : Math.log2(rawScore + 1) * 10;
    const consistency = isDNF ? 0 : randomInt(20, 100);

    await supabase.from("activity_snapshots").upsert(
      {
        profile_id: profile.id,
        period_start: periodStart,
        period_end: periodEnd,
        commits_count: commits,
        prs_opened: prsOpened,
        prs_merged: prsMerged,
        prs_reviewed: prsReviewed,
        issues_opened: issuesOpened,
        issues_closed: issuesClosed,
        lines_added: linesAdded,
        lines_deleted: linesDeleted,
        repos_contributed_to: reposContributed,
        speed_score: speed,
        consistency_score: consistency,
        impact_score: Math.log2(prsMerged * 3 + prsReviewed * 2 + reposContributed * 1.5 + 1) * 10,
      },
      { onConflict: "profile_id,period_start,period_end" }
    );

    // Race entry with position based on speed ranking
    await supabase.from("race_entries").upsert(
      {
        race_id: race.id,
        profile_id: profile.id,
        grid_position: i + 1,
        current_position: i + 1,
        lap_progress: isDNF ? 0 : Math.min(100, (speed / 80) * 100),
        speed,
        pit_stops: consistency < 40 ? 2 : consistency < 70 ? 1 : 0,
        fastest_lap: i === 0,
        dnf: isDNF,
      },
      { onConflict: "race_id,profile_id" }
    );

    console.log(
      `  ${profile.github_username}: speed=${speed.toFixed(1)}, pos=${i + 1}${isDNF ? " (DNF)" : ""}`
    );
  }

  console.log("\nDone! Seeded:");
  console.log(`  ${profiles.length} drivers`);
  console.log(`  1 season`);
  console.log(`  1 active race`);
  console.log(`  ${profiles.length} activity snapshots`);
  console.log(`  ${profiles.length} race entries`);
}

seed().catch(console.error);
