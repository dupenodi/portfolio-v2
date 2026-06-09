import { getGitHubUsername } from "@/lib/env";

export function getBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

/** Accept any valid PAT belonging to GITHUB_USERNAME (no env token match required). */
export async function isGitHubOwnerToken(token: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) return false;

  const user = (await res.json()) as { login?: string };
  return user.login?.toLowerCase() === getGitHubUsername().toLowerCase();
}
