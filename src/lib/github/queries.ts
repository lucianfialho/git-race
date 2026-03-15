import { gql } from "graphql-request";

export const CONTRIBUTION_QUERY = gql`
  query ContributionData($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export const PR_DETAILS_QUERY = gql`
  query PRDetails($from: DateTime!, $to: DateTime!) {
    viewer {
      pullRequests(
        first: 100
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        nodes {
          createdAt
          mergedAt
          additions
          deletions
          state
        }
      }
      contributionsCollection(from: $from, to: $to) {
        pullRequestContributionsByRepository {
          repository {
            nameWithOwner
          }
          contributions(first: 50) {
            nodes {
              pullRequest {
                createdAt
                mergedAt
                additions
                deletions
                state
              }
            }
          }
        }
        issueContributionsByRepository {
          repository {
            nameWithOwner
          }
          contributions(first: 50) {
            nodes {
              issue {
                createdAt
                closedAt
                state
              }
            }
          }
        }
      }
    }
  }
`;

export interface ContributionData {
  viewer: {
    login: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalRepositoriesWithContributedCommits: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
    };
  };
}

export interface PRDetailsData {
  viewer: {
    pullRequests: {
      nodes: Array<{
        createdAt: string;
        mergedAt: string | null;
        additions: number;
        deletions: number;
        state: string;
      }>;
    };
    contributionsCollection: {
      pullRequestContributionsByRepository: Array<{
        repository: { nameWithOwner: string };
        contributions: {
          nodes: Array<{
            pullRequest: {
              createdAt: string;
              mergedAt: string | null;
              additions: number;
              deletions: number;
              state: string;
            };
          }>;
        };
      }>;
      issueContributionsByRepository: Array<{
        repository: { nameWithOwner: string };
        contributions: {
          nodes: Array<{
            issue: {
              createdAt: string;
              closedAt: string | null;
              state: string;
            };
          }>;
        };
      }>;
    };
  };
}
