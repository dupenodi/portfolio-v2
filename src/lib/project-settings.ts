import type { GitHubRepo } from "@/lib/github";
import { publicDb } from "@/lib/supabase";

// GitHub stays the source of projects; Supabase (public.project_settings) only hides, orders, or rewords them.

export type ProjectSetting = { repo_name: string; hidden: boolean; sort: number | null; blurb: string | null };

export async function getProjectSettings(): Promise<Map<string, ProjectSetting>> {
  const db = publicDb();
  if (!db) return new Map();
  const { data, error } = await db.from("project_settings").select("repo_name, hidden, sort, blurb");
  if (error) {
    console.error("project_settings:", error.message);
    return new Map();
  }
  return new Map((data as ProjectSetting[]).map((s) => [s.repo_name, s]));
}

// Hidden repos drop out; ordered ones come first by their number, the rest keep GitHub's order after them.
export function applyProjectSettings(repos: GitHubRepo[], settings: Map<string, ProjectSetting>) {
  return repos
    .filter((r) => !settings.get(r.name)?.hidden)
    .map((r, i) => ({ repo: r, i, s: settings.get(r.name) }))
    .sort((a, b) => (a.s?.sort ?? Infinity) - (b.s?.sort ?? Infinity) || a.i - b.i)
    .map(({ repo, s }) => (s?.blurb ? { ...repo, description: s.blurb } : repo));
}
