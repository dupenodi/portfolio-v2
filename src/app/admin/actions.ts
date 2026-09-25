"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { adminDb, CONTENT_TAG, PHOTOS_BUCKET } from "@/lib/supabase";

// Every write: admin only, then the public site's cached content is dropped so the change shows on the next visit.

async function db() {
  await requireAdmin();
  return adminDb();
}

function published() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/admin", "layout");
}

function fail(what: string, error: { message: string } | null) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const optional = (v: FormDataEntryValue | null) => text(v) || null;
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase letters, numbers and single hyphens");

// ── session ──

export async function login(_: { error?: string; username?: string } | undefined, form: FormData) {
  const username = text(form.get("username"));
  if (!checkCredentials(username, text(form.get("password")))) {
    // A beat before answering, to make guessing slow.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "wrong username or password", username };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ── experience ──

const highlight = z.object({ title: z.string().trim().min(1), body: z.string().trim() });

export async function saveExperience(form: FormData) {
  const client = await db();
  const id = optional(form.get("id"));
  const row = {
    kind: z.enum(["work", "education"]).parse(text(form.get("kind"))),
    title: z.string().min(1, "title is required").parse(text(form.get("title"))),
    org: z.string().min(1, "organisation is required").parse(text(form.get("org"))),
    org_url: optional(form.get("org_url")),
    location: optional(form.get("location")),
    period: z.string().min(1, "period is required").parse(text(form.get("period"))),
    summary: optional(form.get("summary")),
    highlights: z.array(highlight).parse(JSON.parse(text(form.get("highlights")) || "[]")),
    published: form.get("published") === "on",
  };
  if (id) {
    const { error } = await client.from("experience").update(row).eq("id", id);
    fail("save experience", error);
  } else {
    const { data: last } = await client.from("experience").select("sort").order("sort", { ascending: false }).limit(1);
    const { error } = await client.from("experience").insert({ ...row, sort: (last?.[0]?.sort ?? -1) + 1 });
    fail("add experience", error);
  }
  published();
  redirect("/admin/experience");
}

export async function deleteExperience(id: string) {
  const client = await db();
  const { error } = await client.from("experience").delete().eq("id", id);
  fail("delete experience", error);
  published();
}

// Swaps an entry with its neighbour above or below.
async function move(table: "experience" | "photos", id: string, dir: -1 | 1, scope?: { column: string; value: string }) {
  const client = await db();
  let query = client.from(table).select("id, sort").order("sort", { ascending: true });
  if (scope) query = query.eq(scope.column, scope.value);
  const { data, error } = await query;
  fail(`order ${table}`, error);
  const rows = (data ?? []).map((r, i) => ({ id: r.id as string, sort: i }));
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (const [sort, row] of rows.entries()) {
    const { error: e } = await client.from(table).update({ sort }).eq("id", row.id);
    fail(`order ${table}`, e);
  }
  published();
}

export async function moveExperience(id: string, dir: -1 | 1) {
  await move("experience", id, dir);
}

// ── projects ──

export async function saveProject(form: FormData) {
  const client = await db();
  const sort = text(form.get("sort"));
  const row = {
    repo_name: z.string().min(1).parse(text(form.get("repo_name"))),
    hidden: form.get("hidden") === "on",
    sort: sort ? z.coerce.number().int().parse(sort) : null,
    blurb: optional(form.get("blurb")),
  };
  const { error } = await client.from("project_settings").upsert(row, { onConflict: "repo_name" });
  fail("save project", error);
  published();
}

// ── writing ──

const lines = (v: FormDataEntryValue | null) =>
  text(v)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export async function savePost(form: FormData) {
  const client = await db();
  const id = optional(form.get("id"));
  const date = text(form.get("published_at"));
  const row = {
    slug: slug.parse(text(form.get("slug"))),
    title: z.string().min(1, "title is required").parse(text(form.get("title"))),
    description: text(form.get("description")),
    body: typeof form.get("body") === "string" ? (form.get("body") as string) : "",
    published_at: date ? new Date(date).toISOString() : new Date().toISOString(),
    draft: form.get("draft") === "on",
    tags: text(form.get("tags"))
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    answers: lines(form.get("answers")),
  };
  if (id) {
    const { error } = await client.from("posts").update(row).eq("id", id);
    fail("save post", error);
    published();
    redirect(`/admin/writing/${id}?saved=1`);
  }
  const { data, error } = await client.from("posts").insert(row).select("id").single();
  fail("add post", error);
  published();
  redirect(`/admin/writing/${data!.id}?saved=1`);
}

export async function deletePost(id: string) {
  const client = await db();
  const { error } = await client.from("posts").delete().eq("id", id);
  fail("delete post", error);
  published();
  redirect("/admin/writing");
}

// ── photos ──

export async function saveTrip(form: FormData) {
  const client = await db();
  const id = optional(form.get("id"));
  const row = {
    slug: slug.parse(text(form.get("slug"))),
    place: z.string().min(1, "place is required").parse(text(form.get("place"))),
    start_date: z.string().date().parse(text(form.get("start_date"))),
    end_date: optional(form.get("end_date")),
    published: form.get("published") === "on",
  };
  if (id) {
    const { error } = await client.from("trips").update(row).eq("id", id);
    fail("save trip", error);
    published();
    redirect(`/admin/photos/${id}?saved=1`);
  }
  const { data, error } = await client.from("trips").insert(row).select("id").single();
  fail("add trip", error);
  published();
  redirect(`/admin/photos/${data!.id}`);
}

export async function deleteTrip(id: string) {
  const client = await db();
  const { data: photos } = await client.from("photos").select("path").eq("trip_id", id);
  const paths = (photos ?? []).map((p) => p.path as string).filter((p) => !/^https?:/.test(p));
  if (paths.length) {
    const { error: e } = await client.storage.from(PHOTOS_BUCKET).remove(paths);
    fail("remove photo files", e);
  }
  const { error } = await client.from("trips").delete().eq("id", id);
  fail("delete trip", error);
  published();
  redirect("/admin/photos");
}

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

// Photos go from the browser straight to storage (too big for a server action), through one-time signed URLs.
export async function prepareUploads(tripId: string, files: { name: string; type: string }[]) {
  const client = await db();
  const { data: trip, error } = await client.from("trips").select("slug").eq("id", tripId).single();
  fail("find trip", error);
  return Promise.all(
    files.map(async (f) => {
      const ext = TYPES[f.type];
      if (!ext) throw new Error(`${f.name}: only jpeg, png, webp or avif`);
      const base = f.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo";
      const path = `${trip!.slug}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { data, error: e } = await client.storage.from(PHOTOS_BUCKET).createSignedUploadUrl(path);
      fail("sign upload", e);
      return { path, url: data!.signedUrl };
    }),
  );
}

export async function addPhotos(tripId: string, paths: string[]) {
  const client = await db();
  const { data: last } = await client.from("photos").select("sort").eq("trip_id", tripId).order("sort", { ascending: false }).limit(1);
  const start = (last?.[0]?.sort ?? -1) + 1;
  const { error } = await client.from("photos").insert(paths.map((path, i) => ({ trip_id: tripId, path, sort: start + i })));
  fail("add photos", error);
  published();
}

export async function savePhotoAlt(id: string, alt: string) {
  const client = await db();
  const { error } = await client.from("photos").update({ alt: alt.trim() }).eq("id", id);
  fail("save alt text", error);
  published();
}

export async function movePhoto(id: string, tripId: string, dir: -1 | 1) {
  await move("photos", id, dir, { column: "trip_id", value: tripId });
}

export async function deletePhoto(id: string) {
  const client = await db();
  const { data, error } = await client.from("photos").delete().eq("id", id).select("path").single();
  fail("delete photo", error);
  if (data && !/^https?:/.test(data.path)) {
    const { error: e } = await client.storage.from(PHOTOS_BUCKET).remove([data.path]);
    fail("remove photo file", e);
  }
  published();
}
