import Link from "next/link";
import type { GitHubRepo } from "@/lib/github";
import { formatPostDate, formatTripDates } from "@/lib/format";
import { geist, serif } from "@/lib/fonts";
import { getReadingTime, type Post } from "@/lib/posts";
import { site } from "@/lib/site";
import type { Trip } from "@/lib/travel";
import { education, workItems } from "@/lib/work-items";
import { CopyEmail } from "./copy-email";
import { CountUp } from "./count-up";
import { PhotoPrints } from "./photo-prints";
import { ProjectIndex, type ProjectRow } from "./project-index";
import { Reveal } from "./reveal";
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
      preview: repo.private ? undefined : `https://opengraph.githubassets.com/${repo.pushed_at.slice(0, 10)}/${repo.full_name}`,
    };
  });
}

// What the work adds up to, from the work copy itself.
const FIGURES = [
  { to: 100, suffix: "k+", label: "daily users on the infra" },
  { to: 99.9, decimals: 1, suffix: "%", label: "uptime, held" },
  { to: 60, suffix: "k+", label: "monthly clicks from the rag engine" },
  { to: 4, label: "sdk platforms, one middleware" },
];

const external = { target: "_blank", rel: "noreferrer" } as const;

// Everything that lives below the studio.
export function HomeSections({ projects, trips, posts }: { projects: GitHubRepo[]; trips: Trip[]; posts: Post[] }) {
  const job = workItems[0];
  const photoTrips = trips.filter((t) => t.photos.length > 0);
  const sections = [
    { id: "work", label: "work" },
    ...(projects.length ? [{ id: "projects", label: "projects" }] : []),
    ...(posts.length ? [{ id: "writing", label: "writing" }] : []),
    ...(photoTrips.length ? [{ id: "photos", label: "photos" }] : []),
  ];

  return (
    <main className={`${geist.className} ${serif.variable} sections`}>
      <SectionIndex sections={sections} />

      <section id="work" className="block">
        <Reveal className="block-head">
          <h2 className="label">
            <span className="label-num">01</span> work
          </h2>
        </Reveal>
        <div className="block-body">
          <Reveal>
            <p className="statement">
              one company since 2023. <em>the product,</em> the sdks, and the infra under it.
            </p>
          </Reveal>

          <dl className="figures">
            {FIGURES.map((f, i) => (
              <Reveal key={f.label} delay={i * 90} className="figure">
                <dt>{f.label}</dt>
                <dd>
                  <CountUp to={f.to} decimals={f.decimals} suffix={f.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal>
            <p className="row-head">
              <a href={job.companyUrl} {...external}>
                {job.company}
              </a>
              <span className="meta">{job.period}</span>
            </p>
            <p className="soft">
              {job.role}. {job.summary}
            </p>
          </Reveal>

          <ol className="chapters">
            {job.highlights.map((h, i) => {
              const [title, detail] = h.title.split(" — ");
              return (
                <li key={h.title}>
                  <Reveal delay={i * 60}>
                    <details>
                      <summary data-cuelume-hover="tick">
                        <span className="chapter-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="chapter-title">{title}</span>
                        {detail ? <span className="chapter-detail">{detail}</span> : null}
                        <span className="chapter-toggle" aria-hidden="true" />
                      </summary>
                      <p className="chapter-body">{h.body}</p>
                    </details>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <Reveal>
            <p className="row-head spaced">
              <span>{education.school}</span>
              <span className="meta">{education.period}</span>
            </p>
            <p className="soft">
              {education.degree}, {education.location}.
            </p>
          </Reveal>
        </div>
      </section>

      {projects.length > 0 ? (
        <section id="projects" className="block">
          <Reveal className="block-head">
            <h2 className="label">
              <span className="label-num">02</span> projects
            </h2>
          </Reveal>
          <div className="block-body wide">
            <Reveal>
              <p className="statement">
                side projects, <em>most recently touched</em> first.
              </p>
            </Reveal>
            <Reveal>
              <ProjectIndex projects={projectRows(projects)} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section id="writing" className="block">
          <Reveal className="block-head">
            <h2 className="label">
              <span className="label-num">03</span> writing
            </h2>
          </Reveal>
          <div className="block-body">
            <Reveal>
              <p className="statement">
                <em>not about code,</em> mostly.
              </p>
            </Reveal>
            <ul className="essays">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Reveal delay={i * 60}>
                    <Link href={`/writing/${post.slug}`} className="essay" data-cuelume-hover="tick">
                      <span className="essay-title">{post.metadata.title}</span>
                      <span className="essay-desc">{post.metadata.description.toLowerCase()}</span>
                      <span className="essay-meta">
                        {formatPostDate(post.metadata.date)} · {getReadingTime(post.content)}
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {photoTrips.length > 0 ? (
        <section id="photos" className="block">
          <Reveal className="block-head">
            <h2 className="label">
              <span className="label-num">04</span> photos
            </h2>
          </Reveal>
          <div className="block-body">
            {photoTrips.map((trip) => (
              <Reveal key={trip.slug} className="trip">
                <p className="row-head">
                  <span>{trip.place}</span>
                  <span className="meta">{formatTripDates(trip.date, trip.endDate)}</span>
                </p>
                <PhotoPrints photos={trip.photos} caption={trip.place} />
              </Reveal>
            ))}
            <p className="hint">prints can be picked up and moved around.</p>
          </div>
        </section>
      ) : null}

      <footer className="closing">
        <Reveal>
          <p className="closing-line">
            say <em>hi.</em>
          </p>
        </Reveal>
        <Reveal delay={80}>
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
        </Reveal>
        <div className="colophon">
          <span>{site.colophon}</span>
          <a href={site.buyMeAChai} {...external} className="quiet">
            buy me a chai
          </a>
          <a href="#top" className="quiet">
            back to the studio ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
