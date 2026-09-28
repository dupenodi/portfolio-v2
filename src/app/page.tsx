import { preload } from "react-dom";
import { StageLoader } from "@/components/stage-loader";
import { HomeSections } from "@/components/home-sections";
import { LARGE_SCREEN, SHARED, SMALL_SCREEN, sized } from "@/components/studio-assets";
import { getTrips } from "@/lib/travel";
import { getExperience } from "@/lib/experience";
import { getPublishedPosts } from "@/lib/posts";
import { getGitHubCard } from "@/lib/github-card";
import { getLinkedInCard } from "@/lib/linkedin-card";
import { getXCard } from "@/lib/x-card";
import { getProjects } from "@/lib/projects";

// Start the studio's downloads with the HTML, instead of after the three.js chunk loads and asks for them. (Images
// too: they're fetched and decoded as ImageBitmaps, not <img>s.) Each screen size only preloads its own set.
function preloadStudio() {
  const options = { as: "fetch", crossOrigin: "anonymous" } as const;
  for (const href of SHARED) preload(href, options);
  for (const href of Object.values(sized(false))) preload(href, { ...options, media: LARGE_SCREEN });
  for (const href of Object.values(sized(true))) preload(href, { ...options, media: SMALL_SCREEN });
}

export default async function HomePage() {
  preloadStudio();
  // The sections come from the CMS; the intro's link cards are live from github, x and linkedin (cached for a day).
  const [github, x, linkedin, experience, projects, posts, trips] = await Promise.all([
    getGitHubCard(),
    getXCard(),
    getLinkedInCard(),
    getExperience(),
    getProjects(),
    getPublishedPosts(),
    getTrips(),
  ]);
  return (
    <>
      <StageLoader links={{ github, x, linkedin }} />
      <HomeSections experience={experience} projects={projects} posts={posts} trips={trips} />
    </>
  );
}
