import { getGitHubUsername } from "@/lib/env";

export function getBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

export type GitHubTokenCheck =
  | { ok: true; login: string }
  | {
      ok: false;
      reason: "invalid_token" | "wrong_user";
      login?: string;
      expected: string;
    };

/** Accept any valid PAT belonging to GITHUB_USERNAME. */
export async function verifyGitHubOwnerToken(token: string): Promise<GitHubTokenCheck> {
  const expected = getGitHubUsername();

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false, reason: "invalid_token", expected };
  }

  const user = (await res.json()) as { login?: string };
  const login = user.login ?? "";

  if (login.toLowerCase() !== expected.toLowerCase()) {
    return { ok: false, reason: "wrong_user", login, expected };
  }

  return { ok: true, login };
}
