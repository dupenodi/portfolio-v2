import Link from "next/link";
import { formatTripDates } from "@/lib/format";
import { adminDb, photoUrl } from "@/lib/supabase";

export default async function Trips() {
  const { data } = await adminDb().from("trips").select("id, place, start_date, end_date, published, photos(path, sort)").order("start_date", { ascending: false });
  const trips = data ?? [];
  return (
    <>
      <header className="admin-head">
        <h1>photos</h1>
        <Link href="/admin/photos/new" className="admin-button primary">
          new trip
        </Link>
      </header>
      <ul className="admin-trips">
        {trips.map((t) => {
          const cover = [...t.photos].sort((a, b) => a.sort - b.sort)[0];
          return (
            <li key={t.id} data-muted={!t.published || undefined}>
              <Link href={`/admin/photos/${t.id}`}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img src={photoUrl(cover.path)} alt="" loading="lazy" />
                ) : (
                  <span className="admin-trip-empty">no photos</span>
                )}
                <span className="admin-trip-name">{t.place}</span>
                <span className="admin-trip-meta">
                  {formatTripDates(t.start_date, t.end_date ?? undefined)} · {t.photos.length} photo{t.photos.length === 1 ? "" : "s"}
                  {!t.published ? " · hidden" : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {trips.length === 0 ? <p className="admin-empty">no trips yet.</p> : null}
    </>
  );
}
