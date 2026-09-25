import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/reading-progress";
import { formatPostDate } from "@/lib/format";
import { geist, serif } from "@/lib/fonts";
import { getAdjacentPosts, getPostBySlug, getPublishedPosts, getReadingTime } from "@/lib/posts";
import { blogPostingJsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { MDX } from "./mdx";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.metadata.draft) return {};
  const url = absoluteUrl(`/writing/${slug}`);
  return {
    title: `${post.metadata.title} — ${site.identity.primary}`,
    description: post.metadata.description,
    alternates: { canonical: url },
    openGraph: { title: post.metadata.title, description: post.metadata.description, url, type: "article", publishedTime: post.metadata.date },
    twitter: { card: "summary", title: post.metadata.title, description: post.metadata.description, creator: site.twitter },
  };
}

// An essay: one narrow column in the room's own colour, so reading one feels like the lights stayed as you left them.
export default async function EssayPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.metadata.draft) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const jsonLd = blogPostingJsonLd({
    title: post.metadata.title,
    description: post.metadata.description,
    date: post.metadata.date,
    url: absoluteUrl(`/writing/${slug}`),
    answers: post.metadata.answers,
  });

  return (
    <main className={`${geist.className} ${serif.variable} essay-page`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress />
      <nav className="essay-nav">
        <Link href="/#writing" data-cuelume-hover="tick">
          ← sharath
        </Link>
        <span>writing</span>
      </nav>

      <header className="essay-head">
        <p className="essay-date">
          {formatPostDate(post.metadata.date)} · {getReadingTime(post.content)}
        </p>
        <h1>{post.metadata.title}</h1>
        <p className="essay-lede">{post.metadata.description.toLowerCase()}</p>
      </header>

      <article className="prose">
        <MDX source={post.content} />
      </article>

      <footer className="essay-foot">
        <span className="essay-mark" aria-hidden="true">
          ∗
        </span>
        <div className="essay-pager">
          {next ? (
            <Link href={`/writing/${next.slug}`} data-cuelume-hover="tick">
              <span className="label">older</span>
              <span>{next.metadata.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {prev ? (
            <Link href={`/writing/${prev.slug}`} className="newer" data-cuelume-hover="tick">
              <span className="label">newer</span>
              <span>{prev.metadata.title}</span>
            </Link>
          ) : null}
        </div>
        <p className="essay-sign">
          thanks for reading. write back at <a href={`mailto:${site.email}`}>{site.email}</a>, or go{" "}
          <Link href="/">back to the studio</Link>.
        </p>
      </footer>
    </main>
  );
}
