import Link from "next/link";
import type { Post } from "@/lib/posts";

type PostNavProps = {
  prev: Post | null;
  next: Post | null;
};

export function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="post-nav" aria-label="Post navigation">
      <div className="post-nav-grid">
        <div className="post-nav-slot post-nav-slot--prev">
          {prev ? (
            <Link href={`/writing/${prev.slug}`} className="post-nav-link">
              <span className="post-nav-label">← previous</span>
              <span className="post-nav-title">{prev.metadata.title}</span>
            </Link>
          ) : null}
        </div>
        <div className="post-nav-slot post-nav-slot--next">
          {next ? (
            <Link href={`/writing/${next.slug}`} className="post-nav-link">
              <span className="post-nav-label">next ↗</span>
              <span className="post-nav-title">{next.metadata.title}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
