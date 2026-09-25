import { publicDb } from "@/lib/supabase";

// Jobs and education live in Supabase (public.experience), in the order set in /admin.

export type Highlight = { title: string; body: string };

export type Experience = {
  id: string;
  kind: "work" | "education";
  title: string;
  org: string;
  orgUrl: string | null;
  location: string | null;
  period: string;
  summary: string | null;
  highlights: Highlight[];
};

type Row = {
  id: string;
  kind: "work" | "education";
  title: string;
  org: string;
  org_url: string | null;
  location: string | null;
  period: string;
  summary: string | null;
  highlights: Highlight[];
};

export async function getExperience(): Promise<Experience[]> {
  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("experience")
    .select("id, kind, title, org, org_url, location, period, summary, highlights")
    .eq("published", true)
    .order("sort", { ascending: true });
  if (error) {
    console.error("experience:", error.message);
    return [];
  }
  return (data as Row[]).map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    org: r.org,
    orgUrl: r.org_url,
    location: r.location,
    period: r.period,
    summary: r.summary,
    highlights: r.highlights ?? [],
  }));
}
