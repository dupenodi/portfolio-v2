import Link from "next/link";
import { adminDb } from "@/lib/supabase";
import { moveProject } from "../../actions";
import { OrderButtons } from "../order-buttons";

export default async function ProjectList() {
  const { data } = await adminDb().from("projects").select("id, name, image, year, published").order("sort");
  const rows = data ?? [];
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>projects</h1>
          <p className="admin-note">shown on the site in this order; hidden ones stay here for later.</p>
        </div>
        <Link href="/admin/projects/new" className="admin-button primary">
          add
        </Link>
      </header>
      <table className="admin-table">
        <thead>
          <tr>
            <th>name</th>
            <th>picture</th>
            <th>year</th>
            <th>status</th>
            <th className="admin-col-tools">order</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/projects/${r.id}`} className="admin-row-link">
                  {r.name}
                </Link>
              </td>
              <td>{r.image ? "yes" : "—"}</td>
              <td>{r.year ?? "—"}</td>
              <td>{r.published ? <span className="admin-pill live">shown</span> : <span className="admin-pill">hidden</span>}</td>
              <td className="admin-col-tools">
                <OrderButtons up={moveProject.bind(null, r.id, -1)} down={moveProject.bind(null, r.id, 1)} first={i === 0} last={i === rows.length - 1} />
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
