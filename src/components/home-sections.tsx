import { Geist } from "next/font/google";
import type { GitHubRepo } from "@/lib/github";
import { formatTripDates } from "@/lib/format";
import { site } from "@/lib/site";
import type { Trip } from "@/lib/travel";
import { education, workItems } from "@/lib/work-items";
import { PhotoPrints } from "./photo-prints";
import { Reveal } from "./reveal";

const geist = Geist({ subsets: ["latin"], weight: ["400"] });

// First sentence of a repo description, lowercased to match the rest of the page.
function blurb(description: string | null) {
  if (!description) return "";
  const first = description.trim().split(/(?<=[.!?])\s|\s—\s/)[0].replace(/[.!?]$/, "");
  const cut = first.length > 118 ? `${first.slice(0, 118).replace(/[\s,]+\S*$/, "")}…` : first;
  return cut.toLowerCase();
}

function liveHref(homepage: string | null) {
  const value = homepage?.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const external = { target: "_blank", rel: "noreferrer" } as const;

// Everything that lives below the studio: a single quiet column, one idea per section.
export function HomeSections({ projects, trips }: { projects: GitHubRepo[]; trips: Trip[] }) {
  const job = workItems[0];
  const photoTrips = trips.filter((t) => t.photos.length > 0);

  return (
    <main className={`${geist.className} sections`}>
      <section id="work" className="block">
        <Reveal>
          <h2 className="label">work</h2>
        </Reveal>
        <div>
          <Reveal>
            <p className="row-head">
              <a href={job.companyUrl} {...external}>
                {job.company}
              </a>
              <span className="meta">{job.period}</span>
            </p>
            <p className="soft">{job.role}. {job.summary}</p>
          </Reveal>
          <ul className="stack">
            {job.highlights.map((h, i) => (
              <li key={h.title}>
                <Reveal delay={i * 60}>
                  <details>
                    <summary>{h.title}</summary>
                    <p className="soft">{h.body}</p>
                  </details>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <p className="row-head spaced">
              <span>{education.school}</span>
              <span className="meta">{education.period}</span>
            </p>
            <p className="soft">{education.degree}, {education.location}.</p>
          </Reveal>
        </div>
      </section>

      {projects.length > 0 ? (
        <section id="projects" className="block">
          <Reveal>
            <h2 className="label">projects</h2>
          </Reveal>
          <ul className="stack">
            {projects.map((repo, i) => {
              const live = liveHref(repo.homepage);
              return (
                <li key={repo.id}>
                  <Reveal delay={Math.min(i, 6) * 50}>
                    <p className="row-head">
                      <a href={live ?? repo.html_url} {...external}>
                        {repo.name.toLowerCase()}
                      </a>
                      <span className="meta">
                        {repo.language ? `${repo.language.toLowerCase()} · ` : ""}
                        {new Date(repo.created_at).getFullYear()}
                      </span>
                    </p>
                    <p className="soft">
                      {blurb(repo.description)}
                      {live ? (
                        <>
                          {" "}
                          <a className="quiet" href={repo.html_url} {...external}>
                            source
                          </a>
                        </>
                      ) : null}
                    </p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {photoTrips.length > 0 ? (
        <section id="photos" className="block">
          <Reveal>
            <h2 className="label">photos</h2>
          </Reveal>
          <div className="stack">
            {photoTrips.map((trip) => (
              <Reveal key={trip.slug}>
                <p className="row-head">
                  <span>{trip.place}</span>
                  <span className="meta">{formatTripDates(trip.date, trip.endDate)}</span>
                </p>
                <PhotoPrints photos={trip.photos} caption={trip.place} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="block colophon">
        <span />
        <p>
          {site.colophon}. say hi at <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </footer>
    </main>
  );
}
