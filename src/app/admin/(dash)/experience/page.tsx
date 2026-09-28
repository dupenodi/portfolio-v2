import Link from "next/link";
import { adminDb } from "@/lib/supabase";
import { moveExperience } from "../../actions";
import { OrderButtons } from "../order-buttons";

export default async function ExperienceList() {
  const { data } = await adminDb().from("experience").select("id, kind, title, org, period, published").order("sort");
  const rows = data ?? [];
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>experience</h1>
          <p className="admin-note">roles and education, shown on the site in this order.</p>
        </div>
        <Link href="/admin/experience/new" className="admin-button primary">
          add
        </Link>
      </header>
      <table className="admin-table">
        <thead>
          <tr>
            <th>role</th>
            <th>where</th>
            <th>when</th>
            <th>status</th>
            <th className="admin-col-tools">order</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/experience/${r.id}`} className="admin-row-link">
                  {r.title}
                </Link>
                <span className="admin-sub-text">{r.kind}</span>
              </td>
              <td>{r.org}</td>
              <td>{r.period}</td>
              <td>{r.published ? <span className="admin-pill live">shown</span> : <span className="admin-pill">hidden</span>}</td>
              <td className="admin-col-tools">
                <OrderButtons up={moveExperience.bind(null, r.id, -1)} down={moveExperience.bind(null, r.id, 1)} first={i === 0} last={i === rows.length - 1} />
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
