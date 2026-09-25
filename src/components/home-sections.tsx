import Link from "next/link";
import type { Experience } from "@/lib/experience";
import type { GitHubRepo } from "@/lib/github";
import { formatPostDate, formatTripDates } from "@/lib/format";
import type { Post } from "@/lib/posts";
import { geist } from "@/lib/fonts";
import { site } from "@/lib/site";
import type { Trip } from "@/lib/travel";
import { CopyEmail } from "./copy-email";
import { PhotoPrints } from "./photo-prints";
import { ProjectGrid, type ProjectRow } from "./project-grid";
import { SectionIndex } from "./section-index";

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

function projectRows(repos: GitHubRepo[]): ProjectRow[] {
  return repos.map((repo) => {
    const live = liveHref(repo.homepage);
    return {
      id: repo.id,
      name: repo.name.toLowerCase(),
      href: live ?? repo.html_url,
      source: live ? repo.html_url : undefined,
      blurb: blurb(repo.description),
      language: repo.language?.toLowerCase() ?? null,
      year: new Date(repo.created_at).getFullYear(),
    };
  });
}

const external = { target: "_blank", rel: "noreferrer" } as const;

// Everything that lives below the studio: experience, projects, writing, photos, and a way to say hi.
export function HomeSections({
  experience,
  projects,
  posts,
  trips,
}: {
  experience: Experience[];
  projects: GitHubRepo[];
  posts: Post[];
  trips: Trip[];
}) {
  const photoTrips = trips.filter((t) => t.photos.length > 0);
  const sections = [
    ...(experience.length ? [{ id: "experience", label: "experience" }] : []),
    ...(projects.length ? [{ id: "projects", label: "projects" }] : []),
    ...(posts.length ? [{ id: "writing", label: "writing" }] : []),
    ...(photoTrips.length ? [{ id: "photos", label: "photos" }] : []),
  ];

  return (
    <main className={`${geist.className} sections`}>
      <SectionIndex sections={sections} />

      {experience.length > 0 ? (
        <section id="experience" className="block">
          <h2 className="label">experience</h2>
          <div className="block-body">
            {experience.map((item) => (
              <article key={item.id} className="role">
                <header className="role-head">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="role-where">
                      {item.orgUrl ? (
                        <a href={item.orgUrl} {...external} className="role-company" data-cuelume-hover="tick">
                          {item.org}
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        item.org
                      )}
                      {item.location ? <span> · {item.location}</span> : null}
                    </p>
                  </div>
                  <span className="meta">{item.period}</span>
                </header>
                {item.summary ? <p className="role-summary">{item.summary}</p> : null}
                {item.highlights.length > 0 ? (
                  <ul className="role-points">
                    {item.highlights.map((h) => (
                      <li key={h.title}>
                        <span className="role-point">{h.title.split(" — ")[0]}</span>
                        <span className="role-point-body">{h.body}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section id="projects" className="block">
          <h2 className="label">projects</h2>
          <div className="block-body wide">
            <ProjectGrid projects={projectRows(projects)} />
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section id="writing" className="block">
          <h2 className="label">writing</h2>
          <div className="block-body">
            <ul className="posts">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/writing/${post.slug}`} className="post" data-cuelume-hover="tick">
                    <span className="post-title">{post.metadata.title}</span>
                    <span className="post-desc">{post.metadata.description.toLowerCase()}</span>
                    <span className="meta">{formatPostDate(post.metadata.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {photoTrips.length > 0 ? (
        <section id="photos" className="block">
          <h2 className="label">photos</h2>
          <div className="block-body">
            {photoTrips.map((trip) => (
              <div key={trip.slug} className="trip">
                <p className="row-head">
                  <span>{trip.place}</span>
                  <span className="meta">{formatTripDates(trip.date, trip.endDate)}</span>
                </p>
                <PhotoPrints photos={trip.photos} caption={trip.place} />
              </div>
            ))}
            <p className="hint">prints can be picked up and moved around.</p>
          </div>
        </section>
      ) : null}

      <footer className="closing">
        <p className="closing-line">say hi.</p>
        <div className="closing-grid">
          <div>
            <p className="label">write</p>
            <CopyEmail email={site.email} />
          </div>
          <div>
            <p className="label">talk</p>
            <a href={site.calendly} {...external} data-cuelume-hover="tick">
              15 minutes, on calendly
            </a>
          </div>
          <div>
            <p className="label">elsewhere</p>
            <p className="closing-links">
              <a href={site.github} {...external} data-cuelume-hover="tick">github</a>
              <a href={site.linkedin} {...external} data-cuelume-hover="tick">linkedin</a>
              <a href={site.twitterUrl} {...external} data-cuelume-hover="tick">x</a>
              <a href={site.resumeUrl} {...external} data-cuelume-hover="tick">resume</a>
            </p>
          </div>
        </div>
        <div className="colophon">
          <span>{site.colophon}</span>
          <a href="#top" className="quiet">
            back to the studio ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
