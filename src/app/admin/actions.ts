"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { adminDb, CONTENT_TAG, PHOTOS_BUCKET } from "@/lib/supabase";

// Every write: admin only, then the public site's cached content is dropped so the change shows on the next visit.
// Form saves return a result for the save bar instead of throwing, so a bad field shows as a message, not a crash.

export type SaveResult = { ok: true; at: number; redirect?: string } | { ok: false; error: string; at: number };

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

// Runs a save after the session check; validation and database errors come back as a readable message.
async function save(run: () => Promise<string | void>): Promise<SaveResult> {
  await requireAdmin();
  try {
    const next = await run();
    published();
    return { ok: true, at: Date.now(), redirect: next || undefined };
  } catch (e) {
    const error =
      e instanceof z.ZodError
        ? e.issues.map((i) => i.message).join("; ")
        : e instanceof Error
          ? e.message.replace(/^.*duplicate key value violates unique constraint "\w+_slug_key".*$/, "that slug is already used")
          : "something went wrong";
    return { ok: false, error, at: Date.now() };
  }
}

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const optional = (v: FormDataEntryValue | null) => text(v) || null;
const required = (name: string) => z.string().min(1, `${name} is required`);
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug: use lowercase letters, numbers and single hyphens");
const link = (name: string) => z.string().url(`${name}: enter a full link, starting with https://`).nullable();

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

// Swaps a row with its neighbour above or below.
async function move(table: "experience" | "projects" | "photos", id: string, dir: -1 | 1, scope?: { column: string; value: string }) {
  const client = await db();
  let query = client.from(table).select("id, sort").order("sort", { ascending: true });
  if (scope) query = query.eq(scope.column, scope.value);
  const { data, error } = await query;
  fail(`order ${table}`, error);
  const rows = (data ?? []).map((r) => r.id as string);
  const i = rows.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (const [sort, rowId] of rows.entries()) {
    fail(`order ${table}`, (await client.from(table).update({ sort }).eq("id", rowId)).error);
  }
  published();
}

async function nextSort(table: "experience" | "projects") {
  const { data } = await adminDb().from(table).select("sort").order("sort", { ascending: false }).limit(1);
  return (data?.[0]?.sort ?? -1) + 1;
}

// ── experience ──

const highlight = z.object({ title: z.string().trim().min(1, "each highlight needs a title"), body: z.string().trim() });

export async function saveExperience(_: SaveResult | undefined, form: FormData) {
  return save(async () => {
    const client = adminDb();
    const id = optional(form.get("id"));
    const row = {
      kind: z.enum(["work", "education"]).parse(text(form.get("kind"))),
      title: required("title").parse(text(form.get("title"))),
      org: required("organisation").parse(text(form.get("org"))),
      org_url: link("link").parse(optional(form.get("org_url"))),
      location: optional(form.get("location")),
      period: required("period").parse(text(form.get("period"))),
      summary: optional(form.get("summary")),
      highlights: z.array(highlight).parse(JSON.parse(text(form.get("highlights")) || "[]")),
      published: form.get("published") === "on",
    };
    if (id) {
      fail("save experience", (await client.from("experience").update(row).eq("id", id)).error);
      return;
    }
    const { data, error } = await client.from("experience").insert({ ...row, sort: await nextSort("experience") }).select("id").single();
    fail("add experience", error);
    return `/admin/experience/${data!.id}?saved=1`;
  });
}

export async function deleteExperience(id: string) {
  const client = await db();
  fail("delete experience", (await client.from("experience").delete().eq("id", id)).error);
  published();
  redirect("/admin/experience");
}

export async function moveExperience(id: string, dir: -1 | 1) {
  await move("experience", id, dir);
}

// ── projects ──

export async function saveProject(_: SaveResult | undefined, form: FormData) {
  return save(async () => {
    const client = adminDb();
    const id = optional(form.get("id"));
    const year = text(form.get("year"));
    const row = {
      name: required("name").parse(text(form.get("name"))),
      description: text(form.get("description")),
      url: link("link").parse(optional(form.get("url"))),
      source_url: link("source link").parse(optional(form.get("source_url"))),
      language: optional(form.get("language")),
      year: year ? z.coerce.number({ message: "year must be a number" }).int().min(1990).max(2100).parse(year) : null,
      image: optional(form.get("image")),
      published: form.get("published") === "on",
    };
    if (id) {
      const { data: before } = await client.from("projects").select("image").eq("id", id).single();
      fail("save project", (await client.from("projects").update(row).eq("id", id)).error);
      // A replaced or removed picture's file goes with it.
      if (before?.image && before.image !== row.image) await removeStored(before.image);
      return;
    }
    const { data, error } = await client.from("projects").insert({ ...row, sort: await nextSort("projects") }).select("id").single();
    fail("add project", error);
    return `/admin/projects/${data!.id}?saved=1`;
  });
}

export async function deleteProject(id: string) {
  const client = await db();
  const { data, error } = await client.from("projects").delete().eq("id", id).select("image").single();
  fail("delete project", error);
  if (data?.image) await removeStored(data.image);
  published();
  redirect("/admin/projects");
}

export async function moveProject(id: string, dir: -1 | 1) {
  await move("projects", id, dir);
}

async function removeStored(path: string) {
  if (/^https?:/.test(path)) return;
  fail("remove old picture", (await adminDb().storage.from(PHOTOS_BUCKET).remove([path])).error);
}

// The link's own preview picture (og:image, else twitter:image), copied into storage so the site doesn't depend on
// the other site keeping it. Returns the stored path; it's saved with the project's form.
export async function grabLinkPreview(link: string) {
  const client = await db();
  const page = new URL(z.string().url("enter the project's link first").parse(link));
  const headers = { "user-agent": "Mozilla/5.0 (compatible; dupenodi.dev link preview)" };
  const html = await fetch(page, { headers, signal: AbortSignal.timeout(10_000) })
    .then((r) => (r.ok ? r.text() : ""))
    .catch(() => "");
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const content = (name: string) => {
    const tag = tags.find((t) => new RegExp(`(property|name)=["']${name}["']`, "i").test(t));
    return tag?.match(/content=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&");
  };
  const src = content("og:image") ?? content("og:image:url") ?? content("twitter:image");
  if (!src) throw new Error(`${page.hostname} has no link preview picture; upload a screenshot instead`);

  const res = await fetch(new URL(src, page), { headers, signal: AbortSignal.timeout(15_000) });
  const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!res.ok || !TYPES[type]) throw new Error(`couldn't use ${page.hostname}'s preview picture (${res.status}, ${type || "no type"})`);
  const body = await res.arrayBuffer();
  const slugged = page.hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-");
  const path = `projects/${slugged}-${crypto.randomUUID().slice(0, 8)}.${TYPES[type]}`;
  fail("store preview", (await client.storage.from(PHOTOS_BUCKET).upload(path, body, { contentType: type })).error);
  return path;
}

// ── writing ──

const lines = (v: FormDataEntryValue | null) =>
  text(v)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export async function savePost(_: SaveResult | undefined, form: FormData) {
  return save(async () => {
    const client = adminDb();
    const id = optional(form.get("id"));
    const date = text(form.get("published_at"));
    const row = {
      slug: slug.parse(text(form.get("slug"))),
      title: required("title").parse(text(form.get("title"))),
      description: text(form.get("description")),
      body: typeof form.get("body") === "string" ? (form.get("body") as string) : "",
      // The input is UTC wall-clock time (no zone), so read it as UTC.
      published_at: date ? new Date(`${date}Z`).toISOString() : new Date().toISOString(),
      draft: form.get("draft") === "on",
      tags: text(form.get("tags"))
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      answers: lines(form.get("answers")),
    };
    if (id) {
      fail("save essay", (await client.from("posts").update(row).eq("id", id)).error);
      return;
    }
    const { data, error } = await client.from("posts").insert(row).select("id").single();
    fail("add essay", error);
    return `/admin/writing/${data!.id}?saved=1`;
  });
}

export async function deletePost(id: string) {
  const client = await db();
  fail("delete essay", (await client.from("posts").delete().eq("id", id)).error);
  published();
  redirect("/admin/writing");
}

// ── photos ──

export async function saveTrip(_: SaveResult | undefined, form: FormData) {
  return save(async () => {
    const client = adminDb();
    const id = optional(form.get("id"));
    const row = {
      slug: slug.parse(text(form.get("slug"))),
      place: required("place").parse(text(form.get("place"))),
      start_date: z.string().date("pick a start date").parse(text(form.get("start_date"))),
      end_date: optional(form.get("end_date")),
      published: form.get("published") === "on",
    };
    if (!id) {
      const { data, error } = await client.from("trips").insert(row).select("id").single();
      fail("add trip", error);
      return `/admin/photos/${data!.id}?saved=1`;
    }
    fail("save trip", (await client.from("trips").update(row).eq("id", id)).error);
    // Each photo's alt text is part of the same form.
    for (const [key, value] of form.entries()) {
      if (!key.startsWith("alt:")) continue;
      fail("save alt text", (await client.from("photos").update({ alt: text(value) }).eq("id", key.slice(4)).eq("trip_id", id)).error);
    }
  });
}

export async function deleteTrip(id: string) {
  const client = await db();
  const { data: photos } = await client.from("photos").select("path").eq("trip_id", id);
  const paths = (photos ?? []).map((p) => p.path as string).filter((p) => !/^https?:/.test(p));
  if (paths.length) fail("remove photo files", (await client.storage.from(PHOTOS_BUCKET).remove(paths)).error);
  fail("delete trip", (await client.from("trips").delete().eq("id", id)).error);
  published();
  redirect("/admin/photos");
}

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

// Images go from the browser straight to storage (too big for a server action), through one-time signed URLs.
// `folder` is the trip's slug.
export async function prepareUploads(folder: string, files: { name: string; type: string }[]) {
  const client = await db();
  const safeFolder = z.string().regex(/^[a-z0-9-]+$/).parse(folder);
  return Promise.all(
    files.map(async (f) => {
      const ext = TYPES[f.type];
      if (!ext) throw new Error(`${f.name}: only jpeg, png, webp or avif`);
      const base = f.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
      const path = `${safeFolder}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { data, error } = await client.storage.from(PHOTOS_BUCKET).createSignedUploadUrl(path);
      fail("sign upload", error);
      return { path, url: data!.signedUrl };
    }),
  );
}

export async function addPhotos(tripId: string, paths: string[]) {
  const client = await db();
  const { data: last } = await client.from("photos").select("sort").eq("trip_id", tripId).order("sort", { ascending: false }).limit(1);
  const start = (last?.[0]?.sort ?? -1) + 1;
  fail("add photos", (await client.from("photos").insert(paths.map((path, i) => ({ trip_id: tripId, path, sort: start + i })))).error);
  published();
}

export async function movePhoto(id: string, tripId: string, dir: -1 | 1) {
  await move("photos", id, dir, { column: "trip_id", value: tripId });
}

export async function deletePhoto(id: string) {
  const client = await db();
  const { data, error } = await client.from("photos").delete().eq("id", id).select("path").single();
  fail("delete photo", error);
  if (data && !/^https?:/.test(data.path)) fail("remove photo file", (await client.storage.from(PHOTOS_BUCKET).remove([data.path])).error);
  published();
}
