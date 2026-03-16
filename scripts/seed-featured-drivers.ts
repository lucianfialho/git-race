/**
 * Seed featured drivers from famous GitHub users
 *
 * Run: npx tsx scripts/seed-featured-drivers.ts
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { FEATURED_GITHUB_USERS } from "../src/lib/github/featured-drivers";

// Load env
import { config } from "dotenv";
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  stargazers_count: number;
  language: string | null;
}

async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "GitRace-Seed" },
    });
    if (!res.ok) {
      console.warn(`  Failed to fetch ${username}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`  Error fetching ${username}:`, err);
    return null;
  }
}

async function fetchUserOrgs(username: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/orgs`, {
      headers: { "User-Agent": "GitRace-Seed" },
    });
    if (!res.ok) return [];
    const orgs = await res.json();
    return orgs.map((o: { login: string }) => o.login);
  } catch {
    return [];
  }
}

async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`,
      { headers: { "User-Agent": "GitRace-Seed" } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function calculateCarStats(user: GitHubUser, repos: GitHubRepo[]) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  // Power Unit: based on repos count (proxy for commits volume)
  const power_unit = Math.min(100, Math.round(Math.log2(user.public_repos * 3 + 1) * 10));

  // Aero: based on stars (proxy for PR/contribution quality)
  const aero = Math.min(100, Math.round(Math.log2(totalStars + 1) * 5));

  // Reliability: based on followers (consistent, trusted contributor)
  const reliability = Math.min(100, Math.round(Math.log2(user.followers + 1) * 6));

  // Tire Mgmt: based on following ratio (community engagement)
  const tire_mgmt = Math.min(100, Math.round(Math.log2(user.following * 2 + user.public_repos + 1) * 8));

  // Strategy: based on diversity of repos
  const languages = new Set(repos.map((r) => r.language).filter(Boolean));
  const strategy = Math.min(100, Math.round(Math.log2(languages.size * 5 + user.public_repos + 1) * 9));

  return { power_unit, aero, reliability, tire_mgmt, strategy };
}

async function main() {
  console.log("Seeding featured drivers from GitHub...\n");

  let seeded = 0;

  for (const username of FEATURED_GITHUB_USERS) {
    console.log(`Fetching ${username}...`);

    const user = await fetchGitHubUser(username);
    if (!user) continue;

    const [repos, orgs] = await Promise.all([
      fetchUserRepos(username),
      fetchUserOrgs(username),
    ]);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const langCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const carStats = calculateCarStats(user, repos);

    // Generate a unique github_id based on username hash (since we don't have real auth)
    const githubId = Math.abs(
      username.split("").reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      }, 0)
    );

    const { error } = await supabase.from("profiles").upsert(
      {
        github_id: githubId,
        github_username: user.login,
        avatar_url: user.avatar_url,
        car_color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
        total_points: Math.round(
          (carStats.power_unit + carStats.aero + carStats.reliability + carStats.tire_mgmt + carStats.strategy) / 5 * 2
        ),
        car_stats: carStats,
        github_stats: {
          total_stars: totalStars,
          total_repos: user.public_repos,
          followers: user.followers,
          following: user.following,
          top_languages: topLanguages,
          organizations: orgs,
        },
      },
      { onConflict: "github_username" }
    );

    if (error) {
      // Try with github_id conflict
      const { error: error2 } = await supabase.from("profiles").upsert(
        {
          github_id: githubId,
          github_username: user.login,
          avatar_url: user.avatar_url,
          car_color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
          total_points: Math.round(
            (carStats.power_unit + carStats.aero + carStats.reliability + carStats.tire_mgmt + carStats.strategy) / 5 * 2
          ),
          car_stats: carStats,
          github_stats: {
            total_stars: totalStars,
            total_repos: user.public_repos,
            followers: user.followers,
            following: user.following,
            top_languages: topLanguages,
            organizations: orgs,
          },
        },
        { onConflict: "github_id" }
      );
      if (error2) {
        console.warn(`  Error seeding ${username}:`, error2.message);
        continue;
      }
    }

    const ovr = Math.round((carStats.power_unit + carStats.aero + carStats.reliability + carStats.tire_mgmt + carStats.strategy) / 5);
    console.log(`  ✓ ${user.login} — ${totalStars.toLocaleString()} stars, ${user.followers.toLocaleString()} followers, orgs: [${orgs.join(", ")}] — OVR: ${ovr}`);
    seeded++;

    // Rate limit: 60 req/hour unauthenticated, we make 2 per user
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\nDone! Seeded ${seeded}/${FEATURED_GITHUB_USERS.length} drivers.`);
}

main().catch(console.error);
