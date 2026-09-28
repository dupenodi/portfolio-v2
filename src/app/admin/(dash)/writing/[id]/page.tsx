import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { deletePost, savePost } from "../../../actions";
import { AdminForm, ConfirmButton, Label } from "../../../ui";

// ISO timestamp → the value a datetime-local input wants, in UTC.
const forInput = (iso: string) => new Date(iso).toISOString().slice(0, 16);

export default async function PostEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
            ← all writing
          </Link>
        </div>
      </header>
      <AdminForm action={savePost}>
        {post ? <input type="hidden" name="id" value={post.id} /> : null}
        <div className="admin-grid">
          <label>
            <Label>title</Label>
            <input name="title" defaultValue={post?.title ?? ""} required />
          </label>
          <label>
            <Label hint="the address: /writing/…">slug</Label>
            <input name="slug" defaultValue={post?.slug ?? ""} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </label>
          <label>
            <Label hint="utc">date</Label>
            <input name="published_at" type="datetime-local" defaultValue={post ? forInput(post.published_at) : forInput(new Date().toISOString())} />
          </label>
          <label>
            <Label hint="comma separated">tags</Label>
            <input name="tags" defaultValue={post?.tags?.join(", ") ?? ""} />
          </label>
        </div>
        <label>
          <Label hint="the list, rss and link previews">description</Label>
          <textarea name="description" rows={2} defaultValue={post?.description ?? ""} />
        </label>
        <label>
          <Label hint="one per line; optional">what it covers</Label>
          <textarea name="answers" rows={2} defaultValue={post?.answers?.join("\n") ?? ""} />
        </label>
        <label>
          <Label hint="markdown / mdx">body</Label>
          <textarea name="body" rows={24} className="admin-code" defaultValue={post?.body ?? ""} />
        </label>
        <label className="admin-check">
          <input type="checkbox" name="draft" defaultChecked={post?.draft ?? true} /> draft (hidden from the site)
        </label>
      </AdminForm>
      {post ? (
        <form action={deletePost.bind(null, post.id)} className="admin-danger-zone">
          <ConfirmButton message={`delete "${post.title}" for good?`}>delete essay</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
