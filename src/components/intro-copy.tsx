import { geist } from "@/lib/fonts";
import type { GitHubCard as GitHubData } from "@/lib/github-card";
import type { LinkedInCard as LinkedInData } from "@/lib/linkedin-card";
import type { XCard as XData } from "@/lib/x-card";
import { site } from "@/lib/site";
import { HoverCard } from "./hover-card";
import { HoverList, type HoverItem } from "./hover-list";
import { GitHubCard, LinkedInCard, MailCard, PdfCard, SiteCard, XCard } from "./link-cards";

const AVATAR = "/media/avatar.jpg";
const RESUME_PREVIEW = "/media/resume-preview.jpg";

export type LinkData = { github: GitHubData | null; x: XData; linkedin: LinkedInData };

function links({ github, x, linkedin }: LinkData): HoverItem[] {
  return [
    { label: "email", href: `mailto:${site.email}`, width: 300, card: <MailCard /> },
    { label: "resume", href: site.resumeUrl, width: 280, card: <PdfCard href={site.resumeUrl} image={RESUME_PREVIEW} />, warm: [RESUME_PREVIEW] },
    {
      label: "github",
      href: site.github,
      width: 356,
      // Without the api's data there's no graph to draw, so the link goes bare.
      card: github ? <GitHubCard data={github} /> : undefined,
      warm: [AVATAR],
    },
    { label: "linkedin", href: site.linkedin, width: 312, card: <LinkedInCard data={linkedin} />, warm: [linkedin.photo ?? AVATAR, "/media/niti-logo-2.webp"] },
    { label: "x", href: site.twitterUrl, width: 300, card: <XCard data={x} />, warm: [x.avatar] },
  ];
}

// Quiet, lowercase copy over the studio, in the page's HTML from the first paint.
export function IntroCopy({ data }: { data: LinkData }) {
  return (
    <>
      <section
        className={`${geist.className} intro-copy`}
        // Clicks and drags pass through the copy to the studio behind it (so the painting and lamp under it stay
        // clickable); only the links catch them.
        style={{ pointerEvents: "none" }}
      >
        <p>hi, i&apos;m sharath.</p>
        <p>
          was the founding fullstack engineer at{" "}
          <HoverCard
            href={site.companyUrl}
            width={288}
            className={geist.className}
            warm={["/media/niti-preview.jpg"]}
            card={
              <SiteCard
                href={site.companyUrl}
                host="niti.ai"
                image="/media/niti-preview.jpg"
                caption="decision intelligence for marketing spend. aug 2023 - sep 2026."
              />
            }
          >
            {site.company.toLowerCase()}
          </HoverCard>
          .
        </p>
        <p style={{ color: "var(--ink-soft)" }}>{site.heroHeadline}</p>

        <p style={{ marginTop: "3.25rem", fontSize: "0.8rem", color: "var(--ink-faint)" }}>
          links
        </p>
        <HoverList items={links(data)} />
      </section>
      <nav
        className={`${geist.className} intro-index`}
        aria-label="sections"
        style={{ color: "var(--ink-faint)", pointerEvents: "none" }}
      >
        <a href="#experience" data-cuelume-hover="tick">
          experience
        </a>
        ,{" "}
        <a href="#projects" data-cuelume-hover="tick">
          projects
        </a>
        ,{" "}
        <a href="#writing" data-cuelume-hover="tick">
          writing
        </a>
        ,{" "}
        <a href="#photos" data-cuelume-hover="tick">
          photos
        </a>{" "}
        ↓
      </nav>
    </>
  );
}
