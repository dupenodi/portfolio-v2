import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase";
import { deleteExperience, saveExperience } from "../../../actions";
import { AdminForm, ConfirmButton, HighlightsEditor, Label } from "../../../ui";

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
          ← all experience
        </Link>
      </header>
      <AdminForm action={saveExperience}>
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="admin-grid">
          <label>
            <Label>kind</Label>
            <select name="kind" defaultValue={row?.kind ?? "work"}>
              <option value="work">work</option>
              <option value="education">education</option>
            </select>
          </label>
          <label>
            <Label hint="as it should read, e.g. month year — now">period</Label>
            <input name="period" defaultValue={row?.period ?? ""} required />
          </label>
          <label>
            <Label hint="role or degree">title</Label>
            <input name="title" defaultValue={row?.title ?? ""} required />
          </label>
          <label>
            <Label hint="company or school">organisation</Label>
            <input name="org" defaultValue={row?.org ?? ""} required />
          </label>
          <label>
            <Label hint="optional">link</Label>
            <input name="org_url" type="url" defaultValue={row?.org_url ?? ""} placeholder="https://" />
          </label>
          <label>
            <Label hint="optional">location</Label>
            <input name="location" defaultValue={row?.location ?? ""} />
          </label>
        </div>
        <label>
          <Label hint="optional">summary</Label>
          <textarea name="summary" rows={3} defaultValue={row?.summary ?? ""} />
        </label>
        <HighlightsEditor initial={row?.highlights ?? []} />
        <label className="admin-check">
          <input type="checkbox" name="published" defaultChecked={row?.published ?? true} /> show on the site
        </label>
      </AdminForm>
      {row ? (
        <form action={deleteExperience.bind(null, row.id)} className="admin-danger-zone">
          <ConfirmButton message={`delete "${row.title}"?`}>delete</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
