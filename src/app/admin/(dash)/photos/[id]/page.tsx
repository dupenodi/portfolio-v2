import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb, photoUrl } from "@/lib/supabase";
import { deleteTrip, saveTrip } from "../../../actions";
import { ConfirmButton, PhotoManager } from "../../../ui";

export default async function TripEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const { data: trip } = isNew
    ? { data: null }
    : await adminDb().from("trips").select("*, photos(id, path, alt, sort)").eq("id", id).maybeSingle();
  if (!isNew && !trip) notFound();

  const photos = trip
    ? [...trip.photos].sort((a, b) => a.sort - b.sort).map((p) => ({ id: p.id as string, src: photoUrl(p.path), alt: p.alt as string }))
    : [];

  return (
    <>
      <header className="admin-head">
        <h1>{isNew ? "new trip" : trip.place}</h1>
        <Link href="/admin/photos" className="admin-link">
          ← back
        </Link>
      </header>
      {saved ? <p className="admin-saved">saved.</p> : null}
      <form action={saveTrip} className="admin-form wide">
        {trip ? <input type="hidden" name="id" value={trip.id} /> : null}
        <div className="admin-grid">
          <label>
            place
            <input name="place" defaultValue={trip?.place ?? ""} required />
          </label>
          <label>
            slug
            <input name="slug" defaultValue={trip?.slug ?? ""} placeholder="lowercase-with-hyphens" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </label>
          <label>
            from
            <input name="start_date" type="date" defaultValue={trip?.start_date ?? ""} required />
          </label>
          <label>
            to <span className="admin-hint">optional</span>
            <input name="end_date" type="date" defaultValue={trip?.end_date ?? ""} />
          </label>
        </div>
        <label className="admin-check">
          <input type="checkbox" name="published" defaultChecked={trip?.published ?? true} /> show on the site
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-button primary">
            {isNew ? "create, then add photos" : "save"}
          </button>
        </div>
      </form>

      {trip ? (
        <>
          <h2 className="admin-sub">photos</h2>
          <PhotoManager tripId={trip.id} photos={photos} />
          <form action={deleteTrip.bind(null, trip.id)} className="admin-danger-zone">
            <ConfirmButton message={`delete "${trip.place}" and all its photos?`}>delete trip</ConfirmButton>
          </form>
        </>
      ) : null}
    </>
  );
}
