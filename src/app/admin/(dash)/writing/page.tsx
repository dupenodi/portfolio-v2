import Link from "next/link";
import { formatPostDate } from "@/lib/format";
import { adminDb } from "@/lib/supabase";

export default async function WritingList() {
  const { data } = await adminDb().from("posts").select("id, slug, title, published_at, draft, updated_at").order("published_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      <header className="admin-head">
        <h1>writing</h1>
        <Link href="/admin/writing/new" className="admin-button primary">
          new essay
        </Link>
      </header>
      <table className="admin-table">
        <thead>
          <tr>
            <th>title</th>
            <th>date</th>
            <th>status</th>
            <th>edited</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/writing/${r.id}`}>{r.title}</Link>
              </td>
              <td>{formatPostDate(r.published_at)}</td>
              <td>{r.draft ? <span className="admin-pill">draft</span> : <span className="admin-pill live">live</span>}</td>
              <td>{formatPostDate(r.updated_at)}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                nothing yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  );
}
