import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { saveExperience } from "../../../actions";
import { HighlightsEditor } from "../../../ui";

export default async function ExperienceEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const { data: row } = isNew ? { data: null } : await adminDb().from("experience").select("*").eq("id", id).maybeSingle();
  if (!isNew && !row) notFound();

  return (
    <>
      <header className="admin-head">
        <h1>{isNew ? "add experience" : row.title}</h1>
        <Link href="/admin/experience" className="admin-link">
          ← back
        </Link>
      </header>
      <form action={saveExperience} className="admin-form wide">
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="admin-grid">
          <label>
            kind
            <select name="kind" defaultValue={row?.kind ?? "work"}>
              <option value="work">work</option>
              <option value="education">education</option>
            </select>
          </label>
          <label>
            period
            <input name="period" defaultValue={row?.period ?? ""} placeholder="aug 2023 — now" required />
          </label>
          <label>
            title
            <input name="title" defaultValue={row?.title ?? ""} placeholder="founding fullstack engineer" required />
          </label>
          <label>
            organisation
            <input name="org" defaultValue={row?.org ?? ""} placeholder="niti ai" required />
          </label>
          <label>
            link
            <input name="org_url" type="url" defaultValue={row?.org_url ?? ""} placeholder="https://" />
          </label>
          <label>
            location
            <input name="location" defaultValue={row?.location ?? ""} placeholder="bengaluru" />
          </label>
        </div>
        <label>
          summary
          <textarea name="summary" rows={3} defaultValue={row?.summary ?? ""} />
        </label>
        <HighlightsEditor initial={row?.highlights ?? []} />
        <label className="admin-check">
          <input type="checkbox" name="published" defaultChecked={row?.published ?? true} /> show on the site
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-button primary">
            save
          </button>
        </div>
      </form>
    </>
  );
}
