import { SectionHead } from "@/retired/components/section-head";
import { createMetadata } from "@/lib/seo";
import { education, skillGroups, workItems } from "@/lib/work-items";

export const metadata = createMetadata({
  title: "work",
  description:
    "prev founding fullstack @ niti.ai. loop, client sdks, rag engagement, and the infra behind 100k+ daily users.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <div className="page-enter">
      <SectionHead>work</SectionHead>
      <div className="glist stagger">
        {workItems.map((item) => (
          <div key={item.index} className="grow">
            <span className="g-ix">{item.index}</span>
            <div className="work-body">
              <div className="role">{item.role}</div>
              <div className="co">
                {item.companyUrl ? (
                  <a href={item.companyUrl} className="ilink" target="_blank" rel="noopener noreferrer">
                    {item.company}
                  </a>
                ) : (
                  item.company
                )}{" "}
                <span className="yr">
                  / {item.location} / {item.period}
                </span>
              </div>
              <p className="desc">{item.summary}</p>
              <div className="work-hls">
                {item.highlights.map((highlight) => (
                  <div key={highlight.title} className="work-hl">
                    <div className="work-hl-title">{highlight.title}</div>
                    <p className="work-hl-body">{highlight.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="grow">
          <span className="g-ix">{education.index}</span>
          <div className="work-body">
            <div className="role">{education.degree}</div>
            <div className="co">
              {education.school}{" "}
              <span className="yr">
                / {education.location} / {education.period}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="work-skills">
        {skillGroups.map((group) => (
          <div key={group.label} className="skill-row">
            <span className="skill-label">{group.label}</span>
            <span className="skill-items">{group.items}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
