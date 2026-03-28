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
  pushed_at: string;
  fork: boolean;
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100&type=owner`,
    {
      headers,
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return [];

  const repos: GitHubRepo[] = await res.json();

  // Shows repos tagged with the "portfolio" topic on GitHub.
  // To tag a repo: repo page → hover "About" in right sidebar → click ⚙️ → add topic "portfolio"
  const featured = repos.filter((r) => !r.fork && r.topics?.includes("portfolio"));

  // Falls back to all non-fork repos until at least one is tagged
  return featured.length > 0 ? featured : repos.filter((r) => !r.fork);
}
