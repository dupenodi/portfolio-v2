import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import { getGitHubRepos } from "@/lib/github";
import { getBlogPosts } from "@/lib/blog-feed";

export default async function Home() {
  const [repos, posts] = await Promise.all([
    getGitHubRepos(process.env.GITHUB_USERNAME ?? "dupenodi"),
    getBlogPosts(process.env.BLOG_FEED_URL ?? "https://reminiscence.bearblog.dev/feed/"),
  ]);

  return (
    <main>
      <Hero />
      <About />
      <Projects repos={repos} />
      <Experience />
      <Blog posts={posts} />
      <Contact />
    </main>
  );
}
