import { notFound } from "next/navigation";
import { MDX } from "./mdx";
import { BackLink } from "@/retired/components/back-link";
import { PostNav } from "@/retired/components/post-nav";
import { JsonLd } from "@/retired/components/json-ld";
import { formatPostDate } from "@/lib/format";
import {
  getAdjacentPosts,
  getPostBySlug,
  getPublishedPosts,
  getReadingTime,
} from "@/lib/posts";
import { blogPostingJsonLd, createMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || (post.metadata.draft && process.env.NODE_ENV === "production")) {
    return {};
  }

  return createMetadata({
    title: post.metadata.title,
    description: post.metadata.description,
    path: `/writing/${slug}`,
    type: "article",
    publishedTime: post.metadata.date,
    noIndex: post.metadata.draft,
  });
}

export default async function WritingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  if (post.metadata.draft && process.env.NODE_ENV === "production") notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const readingTime = getReadingTime(post.content);
  const { tags, answers } = post.metadata;

  return (
    <article className="page-enter">
      <JsonLd
        data={blogPostingJsonLd({
          title: post.metadata.title,
          description: post.metadata.description,
          date: post.metadata.date,
          url: absoluteUrl(`/writing/${slug}`),
          answers,
        })}
      />

      <BackLink href="/writing">writing</BackLink>

      {post.metadata.draft ? <p className="d-eyebrow">draft</p> : null}

      <h1 className="d-title">{post.metadata.title}</h1>
      <p className="d-meta">
        {formatPostDate(post.metadata.date)}
        <span className="sep">/</span>
        {readingTime}
      </p>

      {tags.length > 0 ? (
        <div className="d-stack post-tags">
          {tags.map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="d-body">
        {answers.length > 0 ? (
          <>
            <h3>what this covers</h3>
            <ul>
              {answers.map((answer) => (
                <li key={answer}>{answer}</li>
              ))}
            </ul>
          </>
        ) : null}
        <MDX source={post.content} />
      </div>

      <PostNav prev={prev} next={next} />
    </article>
  );
}
