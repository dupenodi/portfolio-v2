import Link from "next/link";
import { adminDb } from "@/lib/supabase";
import { deleteExperience, moveExperience } from "../../actions";
import { ConfirmButton } from "../../ui";

export default async function ExperienceList() {
  const { data } = await adminDb().from("experience").select("id, kind, title, org, period, published").order("sort");
  const rows = data ?? [];
  return (
    <>
      <header className="admin-head">
        <h1>experience</h1>
        <Link href="/admin/experience/new" className="admin-button primary">
          add
        </Link>
      </header>
      <p className="admin-note">shown on the site in this order.</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>role</th>
            <th>where</th>
            <th>when</th>
            <th>kind</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} data-muted={!r.published || undefined}>
              <td>
                <Link href={`/admin/experience/${r.id}`}>{r.title}</Link>
                {!r.published ? <span className="admin-pill">hidden</span> : null}
              </td>
              <td>{r.org}</td>
              <td>{r.period}</td>
              <td>{r.kind}</td>
              <td className="admin-row-tools">
                <form action={moveExperience.bind(null, r.id, -1)}>
                  <button className="admin-link" disabled={i === 0} aria-label="move up">
                    ↑
                  </button>
                </form>
                <form action={moveExperience.bind(null, r.id, 1)}>
                  <button className="admin-link" disabled={i === rows.length - 1} aria-label="move down">
                    ↓
                  </button>
                </form>
                <form action={deleteExperience.bind(null, r.id)}>
                  <ConfirmButton message={`delete "${r.title}"?`}>delete</ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="admin-empty">
                nothing yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  );
}
