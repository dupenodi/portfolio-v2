import { photoUrl, publicDb } from "@/lib/supabase";

// Side projects live in Supabase (public.projects), in the order set in /admin.

export type Project = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  sourceUrl: string | null;
  language: string | null;
  year: number | null;
  // A screenshot or the product's link preview, shown in a browser window on the card.
  image: string | null;
};

type Row = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  source_url: string | null;
  language: string | null;
  year: number | null;
  image: string | null;
};

export async function getProjects(): Promise<Project[]> {
  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("projects")
    .select("id, name, description, url, source_url, language, year, image")
    .eq("published", true)
    .order("sort", { ascending: true });
  if (error) {
    console.error("projects:", error.message);
    return [];
  }
  return (data as Row[]).map(({ source_url, image, ...r }) => ({ ...r, sourceUrl: source_url, image: image ? photoUrl(image) : null }));
}
