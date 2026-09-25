import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { deletePost, savePost } from "../../../actions";
import { ConfirmButton } from "../../../ui";

// ISO timestamp → the value a datetime-local input wants, in UTC.
const forInput = (iso: string) => iso.slice(0, 16);

export default async function PostEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const { data: post } = isNew ? { data: null } : await adminDb().from("posts").select("*").eq("id", id).maybeSingle();
  if (!isNew && !post) notFound();

  return (
    <>
      <header className="admin-head">
        <h1>{isNew ? "new essay" : post.title}</h1>
        <div className="admin-actions">
          {post && !post.draft ? (
            <a href={`/writing/${post.slug}`} target="_blank" rel="noreferrer" className="admin-link">
              view on site ↗
            </a>
          ) : null}
          <Link href="/admin/writing" className="admin-link">
            ← back
          </Link>
        </div>
      </header>
      {saved ? <p className="admin-saved">saved.</p> : null}
      <form action={savePost} className="admin-form wide">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}
        <div className="admin-grid">
          <label>
            title
            <input name="title" defaultValue={post?.title ?? ""} required />
          </label>
          <label>
            slug
            <input name="slug" defaultValue={post?.slug ?? ""} placeholder="lowercase-with-hyphens" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </label>
          <label>
            date (utc)
            <input name="published_at" type="datetime-local" defaultValue={post ? forInput(post.published_at) : forInput(new Date().toISOString())} />
          </label>
          <label>
            tags
            <input name="tags" defaultValue={post?.tags?.join(", ") ?? ""} placeholder="comma, separated" />
          </label>
        </div>
        <label>
          description
          <textarea name="description" rows={2} defaultValue={post?.description ?? ""} placeholder="one or two sentences; used in the list, rss and link previews" />
        </label>
        <label>
          what it covers <span className="admin-hint">one per line, optional</span>
          <textarea name="answers" rows={2} defaultValue={post?.answers?.join("\n") ?? ""} />
        </label>
        <label>
          body <span className="admin-hint">markdown / mdx</span>
          <textarea name="body" rows={24} className="admin-code" defaultValue={post?.body ?? ""} />
        </label>
        <label className="admin-check">
          <input type="checkbox" name="draft" defaultChecked={post?.draft ?? true} /> draft (hidden from the site)
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-button primary">
            save
          </button>
        </div>
      </form>
      {post ? (
        <form action={deletePost.bind(null, post.id)} className="admin-danger-zone">
          <ConfirmButton message={`delete "${post.title}" for good?`}>delete essay</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
