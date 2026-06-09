/** Server-side env helpers (read at build/request time). */

export function getGitHubRevalidateSeconds(): number {
  const raw = process.env.GITHUB_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : 300;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
}

export function isBookmarksEnabled(): boolean {
  return process.env.SHOW_BOOKMARKS === "true";
}

export function getGitHubUsername(): string {
  return process.env.GITHUB_USERNAME ?? "dupenodi";
}
