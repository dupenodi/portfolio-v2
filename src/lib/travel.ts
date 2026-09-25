import { photoUrl, publicDb } from "@/lib/supabase";

// Photo trips live in Supabase (public.trips + public.photos); the images sit in the public "photos" bucket.

export type TravelPhoto = {
  src: string;
  alt: string;
};

export type Trip = {
  slug: string;
  place: string;
  date: string;
  endDate?: string;
  photos: TravelPhoto[];
};

type Row = {
  slug: string;
  place: string;
  start_date: string;
  end_date: string | null;
  photos: { path: string; alt: string; sort: number }[];
};

// Newest first, each trip's photos in their saved order.
export async function getTrips(): Promise<Trip[]> {
  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("trips")
    .select("slug, place, start_date, end_date, photos(path, alt, sort)")
    .eq("published", true)
    .order("start_date", { ascending: false });
  if (error) {
    console.error("trips:", error.message);
    return [];
  }
  return (data as Row[]).map((t) => ({
    slug: t.slug,
    place: t.place,
    date: t.start_date,
    endDate: t.end_date ?? undefined,
    photos: [...t.photos].sort((a, b) => a.sort - b.sort).map((p) => ({ src: photoUrl(p.path), alt: p.alt })),
  }));
}
