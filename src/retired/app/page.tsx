import Link from "next/link";
import { GitHubContributions } from "@/retired/components/github-contributions";
import { HeroIdentity } from "@/retired/components/hero-identity";
import { site } from "@/lib/site";

export default function HomePage() {
  const { company, workHref, text, emphasis } = site.heroBio;
  const parts = text.split(`the ${emphasis}`);

  return (
    <div className="page-enter hero">
      <div className="stagger">
        <h1 className="hero-name">
          <HeroIdentity />
        </h1>
        <p className="hero-lede">{site.heroHeadline}</p>
        <p className="hero-bio">
          at{" "}
          <Link href={workHref} className="ilink">
            {company}
          </Link>{" "}
          {parts[0]}
          the <strong>{emphasis}</strong>
          {parts[1]}
        </p>
        <GitHubContributions />
      </div>
    </div>
  );
}
