import { SectionHead } from "@/components/section-head";
import { createMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { workItems } from "@/lib/work-items";

export const metadata = createMetadata({
  title: "work",
  description: site.description,
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
                {item.company} <span className="yr">/ {item.period}</span>
              </div>
              <div className="desc">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
