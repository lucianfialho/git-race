import { GraphQLClient } from "graphql-request";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export function createGitHubClient(token: string) {
  return new GraphQLClient(GITHUB_GRAPHQL_URL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
