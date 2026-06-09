import { GListRow } from "@/components/g-list-row";
import { SectionHead } from "@/components/section-head";
import { getGitHubRepos } from "@/lib/github";
import { createMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createMetadata({
  title: "projects",
  description: site.description,
  path: "/projects",
});

function formatIndex(position: number) {
  return String(position).padStart(2, "0");
}

function formatRepoMeta(description: string | null, language: string | null) {
  if (description?.trim()) return description.trim();
  if (language) return language.toLowerCase();
  return undefined;
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
          repos.map((repo, index) => (
            <GListRow
              key={repo.id}
              href={repo.html_url}
              index={formatIndex(index + 1)}
              title={repo.name}
              meta={formatRepoMeta(repo.description, repo.language)}
              external
            />
          ))
        )}
      </div>
    </div>
  );
}
