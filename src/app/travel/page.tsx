import { SectionHead } from "@/components/section-head";
import { TravelTrip } from "@/components/travel-trip";
import { createMetadata } from "@/lib/seo";
import { getTrips } from "@/lib/travel";

export const metadata = createMetadata({
  title: "travel",
  description: "photos from trips.",
  path: "/travel",
});

export default function TravelPage() {
  const trips = getTrips();

  return (
    <div className="page-enter">
      <SectionHead>travel</SectionHead>
      {trips.length === 0 ? (
        <p className="ref">trips coming soon.</p>
      ) : (
        <>
          <p className="t-count">
            {trips.length} {trips.length === 1 ? "place" : "places"}
          </p>
          <div className="t-stack">
            {trips.map((trip) => (
              <TravelTrip key={trip.slug} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
