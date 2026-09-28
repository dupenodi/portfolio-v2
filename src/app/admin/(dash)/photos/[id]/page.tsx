import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb, photoUrl } from "@/lib/supabase";
import { deleteTrip, saveTrip } from "../../../actions";
import { AdminForm, ConfirmButton, Label, PhotoManager } from "../../../ui";

export default async function TripEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const { data: trip } = isNew ? { data: null } : await adminDb().from("trips").select("*, photos(id, path, alt, sort)").eq("id", id).maybeSingle();
  if (!isNew && !trip) notFound();

  const photos = trip
    ? [...trip.photos].sort((a, b) => a.sort - b.sort).map((p) => ({ id: p.id as string, src: photoUrl(p.path), alt: p.alt as string }))
    : [];

  return (
    <>
      <header className="admin-head">
        <h1>{isNew ? "new trip" : trip.place}</h1>
        <Link href="/admin/photos" className="admin-link">
          ← all trips
        </Link>
      </header>
      <AdminForm action={saveTrip}>
        {trip ? <input type="hidden" name="id" value={trip.id} /> : null}
        <div className="admin-grid">
          <label>
            <Label>place</Label>
            <input name="place" defaultValue={trip?.place ?? ""} required />
          </label>
          <label>
            <Label hint="also the photos' folder">slug</Label>
            <input name="slug" defaultValue={trip?.slug ?? ""} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </label>
          <label>
            <Label>from</Label>
            <input name="start_date" type="date" defaultValue={trip?.start_date ?? ""} required />
          </label>
          <label>
            <Label hint="optional">to</Label>
            <input name="end_date" type="date" defaultValue={trip?.end_date ?? ""} />
          </label>
        </div>
        <label className="admin-check">
          <input type="checkbox" name="published" defaultChecked={trip?.published ?? true} /> show on the site
        </label>
        {trip ? (
          <>
            <h2 className="admin-sub">photos</h2>
            <PhotoManager tripId={trip.id} folder={trip.slug} photos={photos} />
          </>
        ) : (
          <p className="admin-note">save the trip first, then add its photos.</p>
        )}
      </AdminForm>
      {trip ? (
        <form action={deleteTrip.bind(null, trip.id)} className="admin-danger-zone">
          <ConfirmButton message={`delete "${trip.place}" and all its photos?`}>delete trip</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
