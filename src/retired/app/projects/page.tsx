import { SectionHead } from "@/retired/components/section-head";
import { getGitHubRepos } from "@/lib/github";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "projects",
  description: "selected work, pulled from github repos tagged portfolio.",
  path: "/projects",
});

function formatIndex(position: number) {
  return String(position).padStart(2, "0");
}

function liveHref(homepage: string | null) {
  const value = homepage?.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export default async function ProjectsPage() {
  const repos = await getGitHubRepos();

  return (
    <div className="page-enter">
      <SectionHead>projects</SectionHead>
      <div className="glist stagger">
        {repos.length === 0 ? (
          <p className="ref">nothing here yet.</p>
        ) : (
          repos.map((repo, index) => {
            const live = liveHref(repo.homepage);

            return (
              <div key={repo.id} className="grow crow proj">
                <span className="g-ix">{formatIndex(index + 1)}</span>
                <div className="c-text">
                  <a
                    href={repo.html_url}
                    className="c-name"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                  {repo.description ? <div className="c-meta">{repo.description}</div> : null}
                  <div className="proj-foot">
                    {repo.language ? (
                      <span className="proj-stack">{repo.language}</span>
                    ) : null}
                    {live ? (
                      <a
                        href={live}
                        className="proj-live"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        live ↗
                      </a>
                    ) : null}
                  </div>
                </div>
                <a
                  href={repo.html_url}
                  className="c-arr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`open ${repo.name} on github`}
                >
                  ↗
                </a>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
