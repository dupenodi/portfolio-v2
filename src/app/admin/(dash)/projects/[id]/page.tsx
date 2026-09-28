import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb, photoUrl } from "@/lib/supabase";
import { deleteProject, saveProject } from "../../../actions";
import { AdminForm, ConfirmButton, Label, ProjectImage } from "../../../ui";

export default async function ProjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const { data: row } = isNew ? { data: null } : await adminDb().from("projects").select("*").eq("id", id).maybeSingle();
  if (!isNew && !row) notFound();

  return (
    <>
      <header className="admin-head">
        <h1>{isNew ? "add project" : row.name}</h1>
        <Link href="/admin/projects" className="admin-link">
          ← all projects
        </Link>
      </header>
      <AdminForm action={saveProject}>
        {row ? <input type="hidden" name="id" value={row.id} /> : null}
        <div className="admin-grid">
          <label>
            <Label>name</Label>
            <input name="name" defaultValue={row?.name ?? ""} required />
          </label>
          <div className="admin-grid tight">
            <label>
              <Label hint="optional">language</Label>
              <input name="language" defaultValue={row?.language ?? ""} />
            </label>
            <label>
              <Label hint="optional">year</Label>
              <input name="year" type="number" inputMode="numeric" defaultValue={row?.year ?? ""} />
            </label>
          </div>
          <label>
            <Label hint="where the card goes; optional">link</Label>
            <input name="url" type="url" defaultValue={row?.url ?? ""} placeholder="https://" />
          </label>
          <label>
            <Label hint="shown as “source”; optional">source link</Label>
            <input name="source_url" type="url" defaultValue={row?.source_url ?? ""} placeholder="https://" />
          </label>
        </div>
        <label>
          <Label hint="one line">description</Label>
          <textarea name="description" rows={2} defaultValue={row?.description ?? ""} />
        </label>
        <div>
          <Label hint="a screenshot of the real thing, or the link's preview">picture</Label>
          <ProjectImage initial={row?.image ?? null} base={photoUrl("")} />
        </div>
        <label className="admin-check">
          <input type="checkbox" name="published" defaultChecked={row?.published ?? true} /> show on the site
        </label>
      </AdminForm>
      {row ? (
        <form action={deleteProject.bind(null, row.id)} className="admin-danger-zone">
          <ConfirmButton message={`delete "${row.name}"?`}>delete project</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
