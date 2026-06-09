import fs from "fs";
import path from "path";
import { z } from "zod";
import { parseLocalDate } from "@/lib/format";

const travelDirectory = path.join(process.cwd(), "content/travel");

const rawPhotoSchema = z.union([
  z.string(),
  z.object({
    src: z.string(),
    alt: z.string().optional(),
  }),
]);

const tripSchema = z
  .object({
    slug: z.string(),
    place: z.string(),
    date: z.string().optional(),
    endDate: z.string().optional(),
    /** @deprecated use `date` — kept so old JSON still loads */
    dates: z.string().optional(),
    photos: z.array(rawPhotoSchema).default([]),
  })
  .transform((trip) => ({
    slug: trip.slug,
    place: trip.place,
    date: trip.date ?? trip.dates ?? "",
    endDate: trip.endDate,
    photos: trip.photos,
  }));

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

/** CMS uploads use /media/...; external URLs (e.g. Cloudinary) also work. */
export function photoSrc(src: string): string {
  return src.startsWith("http") ? src : src.startsWith("/") ? src : `/${src}`;
}

function normalizePhotos(raw: z.infer<typeof rawPhotoSchema>[]): TravelPhoto[] {
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { src: photoSrc(item), alt: "" };
      }
      return { src: photoSrc(item.src), alt: item.alt?.trim() ?? "" };
    })
    .filter((photo) => photo.src.trim());
}

function tripSortTime(trip: Trip): number {
  return parseLocalDate(trip.date)?.getTime() ?? 0;
}

function normalizeTrip(trip: z.infer<typeof tripSchema>): Trip {
  return {
    slug: trip.slug,
    place: trip.place,
    date: trip.date,
    endDate: trip.endDate,
    photos: normalizePhotos(trip.photos),
  };
}

function getTripFiles(): string[] {
  if (!fs.existsSync(travelDirectory)) return [];
  return fs
    .readdirSync(travelDirectory)
    .filter((file) => file.endsWith(".json") && file !== "trips.json");
}

function parseTrip(filename: string): Trip | null {
  const raw = fs.readFileSync(path.join(travelDirectory, filename), "utf-8");
  const data = JSON.parse(raw) as unknown;
  const parsed = tripSchema.safeParse(data);
  if (!parsed.success) return null;

  const trip = normalizeTrip({
    ...parsed.data,
    slug: parsed.data.slug || path.basename(filename, ".json"),
  });

  if (!trip.date || !parseLocalDate(trip.date)) return null;

  return trip;
}

/** Newest first — sorted by `date` (ISO datetime from CMS). */
export function getTrips(): Trip[] {
  return getTripFiles()
    .map(parseTrip)
    .filter((trip): trip is Trip => trip !== null)
    .sort((a, b) => tripSortTime(b) - tripSortTime(a));
}
