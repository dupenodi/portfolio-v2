import { TravelPhotoGrid } from "@/components/travel-photo-grid";
import { formatTripDates } from "@/lib/format";
import type { Trip } from "@/lib/travel";

type TravelTripProps = {
  trip: Trip;
};

export function TravelTrip({ trip }: TravelTripProps) {
  const photos = trip.photos.filter((photo) => photo.src);
  const when = formatTripDates(trip.date, trip.endDate);

  return (
    <section className="t-block" aria-labelledby={`trip-${trip.slug}`}>
      <h2 className="t-title" id={`trip-${trip.slug}`}>
        {trip.place.toLowerCase()}
      </h2>
      {when ? <p className="d-meta">{when}</p> : null}
      {photos.length > 0 ? (
        <TravelPhotoGrid photos={photos} tripPlace={trip.place} />
      ) : null}
    </section>
  );
}
