import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import { getAvailableForOpportunities } from "@/lib/available-for-opportunities";
import { getGitHubRepos } from "@/lib/github";
import { getBlogPosts } from "@/lib/blog-feed";

export default async function Home() {
  const [repos, posts] = await Promise.all([
    getGitHubRepos(process.env.GITHUB_USERNAME ?? "dupenodi"),
    getBlogPosts(process.env.BLOG_FEED_URL ?? "https://reminiscence.bearblog.dev/feed/"),
  ]);
  const availableForOpportunities = getAvailableForOpportunities();

  return (
    <main>
      <Hero availableForOpportunities={availableForOpportunities} />
      <About />
      <Projects repos={repos} />
      <Experience />
      <Blog posts={posts} />
      <Contact />
    </main>
  );
}
