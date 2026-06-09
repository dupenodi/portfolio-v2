import { GListRow } from "@/components/g-list-row";
import { SectionHead } from "@/components/section-head";
import { projects } from "@/lib/projects";
import { createMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createMetadata({
  title: "projects",
  description: site.description,
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="page-enter">
      <SectionHead>projects</SectionHead>
      <div className="glist stagger">
        {projects.map((project) =>
          project.github ? (
            <GListRow
              key={project.name}
              href={project.github}
              index={project.index}
              title={project.name}
              meta={project.meta}
              external
            />
          ) : (
            <div key={project.name} className="grow crow">
              <span className="g-ix">{project.index}</span>
              <div className="c-text">
                <div className="c-name">{project.name}</div>
                <div className="c-meta">{project.meta}</div>
              </div>
              <span className="c-arr" aria-hidden="true" />
            </div>
          )
        )}
      </div>
    </div>
  );
}
