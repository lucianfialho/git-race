import { createGitHubClient } from "./client";
import {
  CONTRIBUTION_QUERY,
  PR_DETAILS_QUERY,
  PROFILE_STATS_QUERY,
  type ContributionData,
  type PRDetailsData,
  type ProfileStatsData,
} from "./queries";
import { calculateScores } from "../race/metrics";
import { calculateCarComponents } from "../race/car-components";
import { createAdminClient } from "../supabase/admin";

interface Profile {
  id: string;
  github_token: string;
  github_username: string;
}

export async function syncProfileActivity(
  profile: Profile,
  periodStart: Date,
  periodEnd: Date
) {
  if (!profile.github_token) {
    console.warn(`No token for ${profile.github_username}, skipping`);
    return null;
  }

  const client = createGitHubClient(profile.github_token);
  const from = periodStart.toISOString();
  const to = periodEnd.toISOString();

  try {
    // Fetch contribution data and PR details in parallel
    const [contributions, prDetails] = await Promise.all([
      client.request<ContributionData>(CONTRIBUTION_QUERY, { from, to }),
      client.request<PRDetailsData>(PR_DETAILS_QUERY, { from, to }),
    ]);

    const collection = contributions.viewer.contributionsCollection;

    // Count PRs merged within period
    const prsMerged = prDetails.viewer.pullRequests.nodes.filter((pr) => {
      if (!pr.mergedAt) return false;
      const merged = new Date(pr.mergedAt);
      return merged >= periodStart && merged <= periodEnd;
    }).length;

    // Count lines added/deleted from PRs in period
    const prsInPeriod = prDetails.viewer.pullRequests.nodes.filter((pr) => {
      const created = new Date(pr.createdAt);
      return created >= periodStart && created <= periodEnd;
    });

    const linesAdded = prsInPeriod.reduce((sum, pr) => sum + pr.additions, 0);
    const linesDeleted = prsInPeriod.reduce(
      (sum, pr) => sum + pr.deletions,
      0
    );

    // Count issues closed
    let issuesClosed = 0;
    for (const repo of prDetails.viewer.contributionsCollection
      .issueContributionsByRepository) {
      issuesClosed += repo.contributions.nodes.filter((n) => {
        if (!n.issue.closedAt) return false;
        const closed = new Date(n.issue.closedAt);
        return closed >= periodStart && closed <= periodEnd;
      }).length;
    }

    // Calculate consistency from contribution calendar
    const days = collection.contributionCalendar.weeks.flatMap(
      (w) => w.contributionDays
    );
    const daysInPeriod = days.filter((d) => {
      const date = new Date(d.date);
      return date >= periodStart && date <= periodEnd;
    });

    const snapshot = {
      commits_count: collection.totalCommitContributions,
      prs_opened: collection.totalPullRequestContributions,
      prs_merged: prsMerged,
      prs_reviewed: collection.totalPullRequestReviewContributions,
      issues_opened: collection.totalIssueContributions,
      issues_closed: issuesClosed,
      lines_added: linesAdded,
      lines_deleted: linesDeleted,
      repos_contributed_to:
        collection.totalRepositoriesWithContributedCommits,
    };

    const scores = calculateScores(snapshot, daysInPeriod);
    const carComponents = calculateCarComponents(snapshot, daysInPeriod);

    return {
      ...snapshot,
      ...scores,
      power_unit_score: carComponents.power_unit,
      aero_score: carComponents.aero,
      reliability_score: carComponents.reliability,
      tire_mgmt_score: carComponents.tire_mgmt,
      strategy_score: carComponents.strategy,
    };
  } catch (error) {
    console.error(`Sync failed for ${profile.github_username}:`, error);
    return null;
  }
}

export async function syncProfileStats(profile: Profile) {
  if (!profile.github_token) return null;

  const client = createGitHubClient(profile.github_token);

  try {
    const data = await client.request<ProfileStatsData>(PROFILE_STATS_QUERY);

    const totalStars = data.viewer.repositories.nodes.reduce(
      (sum, repo) => sum + repo.stargazerCount, 0
    );

    // Count top languages
    const langCounts: Record<string, number> = {};
    for (const repo of data.viewer.repositories.nodes) {
      if (repo.primaryLanguage?.name) {
        langCounts[repo.primaryLanguage.name] = (langCounts[repo.primaryLanguage.name] || 0) + 1;
      }
    }
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const organizations = data.viewer.organizations.nodes.map((org) => org.login);

    return {
      total_stars: totalStars,
      total_repos: data.viewer.repositories.totalCount,
      followers: data.viewer.followers.totalCount,
      following: data.viewer.following.totalCount,
      top_languages: topLanguages,
      organizations,
    };
  } catch (error) {
    console.error(`Profile stats sync failed for ${profile.github_username}:`, error);
    return null;
  }
}

export async function syncAllProfiles(periodStart: Date, periodEnd: Date) {
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, github_token, github_username")
    .not("github_token", "is", null);

  if (error || !profiles) {
    console.error("Failed to fetch profiles:", error);
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  // Process in batches of 5 to respect rate limits
  const batchSize = 5;
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (profile) => {
        const data = await syncProfileActivity(
          profile,
          periodStart,
          periodEnd
        );
        if (!data) return null;

        const { error: upsertError } = await admin
          .from("activity_snapshots")
          .upsert(
            {
              profile_id: profile.id,
              period_start: periodStart.toISOString().split("T")[0],
              period_end: periodEnd.toISOString().split("T")[0],
              ...data,
              synced_at: new Date().toISOString(),
            },
            { onConflict: "profile_id,period_start,period_end" }
          );

        if (upsertError) throw upsertError;

        // Update car_stats on profile
        await admin
          .from("profiles")
          .update({
            car_stats: {
              power_unit: data.power_unit_score,
              aero: data.aero_score,
              reliability: data.reliability_score,
              tire_mgmt: data.tire_mgmt_score,
              strategy: data.strategy_score,
            },
          })
          .eq("id", profile.id);

        return data;
      })
    );

    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) synced++;
      else failed++;
    });
  }

  return { synced, failed };
}
