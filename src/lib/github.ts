import { getGitHubRevalidateSeconds, getGitHubUsername } from "@/lib/env";

export const GITHUB_REPOS_TAG = "github-repos";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  created_at: string;
  pushed_at: string;
  fork: boolean;
}

type GetGitHubReposOptions = {
  fresh?: boolean;
};

export async function getGitHubRepos(
  username = getGitHubUsername(),
  options: GetGitHubReposOptions = {}
): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100&type=owner`,
    {
      headers,
      ...(options.fresh
        ? { cache: "no-store" }
        : {
            next: {
              revalidate: getGitHubRevalidateSeconds(),
              tags: [GITHUB_REPOS_TAG],
            },
          }),
    }
  );

  if (!res.ok) {
    console.error("[github] fetch failed", res.status, await res.text().catch(() => ""));
    return [];
  }

  const repos: GitHubRepo[] = await res.json();

  // Tag repos with topic "portfolio" on GitHub to curate the list (forks included).
  const featured = repos.filter((r) => r.topics?.includes("portfolio"));

  return featured.length > 0 ? featured : repos.filter((r) => !r.fork);
}
