import { getGitHubRevalidateSeconds, getGitHubUsername } from "@/lib/env";

export const GITHUB_REPOS_TAG = "github-repos";
export const PORTFOLIO_TOPIC = "portfolio";

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
  private: boolean;
}

type GetGitHubReposOptions = {
  fresh?: boolean;
};

type GitHubRepoJson = GitHubRepo & {
  owner?: { login?: string };
};

function requestInit(headers: HeadersInit, fresh: boolean): RequestInit {
  return {
    headers,
    ...(fresh
      ? { cache: "no-store" }
      : {
          next: {
            revalidate: getGitHubRevalidateSeconds(),
            tags: [GITHUB_REPOS_TAG],
          },
        }),
  };
}

async function fetchRepoPage(url: string, init: RequestInit): Promise<GitHubRepoJson[]> {
  const res = await fetch(url, init);

  if (!res.ok) {
    console.error("[github] fetch failed", res.status, await res.text().catch(() => ""));
    return [];
  }

  return (await res.json()) as GitHubRepoJson[];
}

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

  const init = requestInit(headers, Boolean(options.fresh));
  const owner = username.toLowerCase();

  // /users/:user/repos is public-only. /user/repos includes private repos
  // for the authenticated owner when GITHUB_TOKEN has the repo scope.
  const url = process.env.GITHUB_TOKEN
    ? "https://api.github.com/user/repos?affiliation=owner&sort=pushed&per_page=100"
    : `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100&type=owner`;

  const repos = await fetchRepoPage(url, init);

  return repos.filter((repo) => {
    const login = repo.owner?.login?.toLowerCase();
    if (login && login !== owner) return false;
    return repo.topics?.includes(PORTFOLIO_TOPIC);
  });
}
