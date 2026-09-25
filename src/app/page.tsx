import { preload } from "react-dom";
import { StageLoader } from "@/components/stage-loader";
import { HomeSections } from "@/components/home-sections";
import { LARGE_SCREEN, SHARED, SMALL_SCREEN, sized } from "@/components/studio-assets";
import { getGitHubRepos } from "@/lib/github";
import { getGitHubCard } from "@/lib/github-card";
import { getLinkedInCard } from "@/lib/linkedin-card";
import { getXCard } from "@/lib/x-card";
import { getTrips } from "@/lib/travel";
import { getExperience } from "@/lib/experience";
import { getPublishedPosts } from "@/lib/posts";
import { applyProjectSettings, getProjectSettings } from "@/lib/project-settings";

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
  const [repos, github, x, linkedin, settings, experience, posts, trips] = await Promise.all([
    getGitHubRepos(),
    getGitHubCard(),
    getXCard(),
    getLinkedInCard(),
    getProjectSettings(),
    getExperience(),
    getPublishedPosts(),
    getTrips(),
  ]);
  return (
    <>
      <StageLoader links={{ github, x, linkedin }} />
      <HomeSections experience={experience} projects={applyProjectSettings(repos, settings)} posts={posts} trips={trips} />
    </>
  );
}
