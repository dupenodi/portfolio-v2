// One-time import of the repo's old file-based content into Supabase. Safe to re-run: rows upsert on their slug and
// photos are replaced per trip.
//
//   node --env-file=.env.local scripts/seed/seed.mjs
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY, and the migration in supabase/migrations applied first.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. in .env.local).");
  process.exit(1);
}

const db = createClient(url, secret, { auth: { persistSession: false } });
const root = process.cwd();
const must = ({ error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
};

// ── experience: only if the table is empty, so edits made in /admin are never overwritten ──
{
  const { count, error } = await db.from("experience").select("id", { count: "exact", head: true });
  must({ error }, "count experience");
  if (count === 0) {
    const rows = JSON.parse(fs.readFileSync(path.join(root, "scripts/seed/experience.json"), "utf8"));
    must(await db.from("experience").insert(rows), "insert experience");
    console.log(`experience: ${rows.length} rows`);
  } else {
    console.log(`experience: already has ${count} rows, skipped`);
  }
}

// ── writing: content/posts/*.mdx ──
{
  const dir = path.join(root, "content/posts");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")) : [];
  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const date = data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString();
    const row = {
      slug: path.basename(file, ".mdx"),
      title: data.title,
      description: data.description ?? "",
      body: content.trim(),
      published_at: date,
      draft: Boolean(data.draft),
      tags: data.tags ?? [],
      answers: data.answers ?? [],
    };
    must(await db.from("posts").upsert(row, { onConflict: "slug" }), `post ${row.slug}`);
  }
  console.log(`posts: ${files.length}`);
}

// ── photos: content/travel/*.json, images uploaded from public/ into the "photos" bucket ──
{
  const dir = path.join(root, "content/travel");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "trips.json") : [];
  const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
  for (const file of files) {
    const trip = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    const slug = trip.slug || path.basename(file, ".json");
    const { data: saved, error } = await db
      .from("trips")
      .upsert(
        { slug, place: trip.place, start_date: (trip.date ?? trip.dates).slice(0, 10), end_date: trip.endDate ? trip.endDate.slice(0, 10) : null },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    must({ error }, `trip ${slug}`);

    must(await db.from("photos").delete().eq("trip_id", saved.id), `clear photos ${slug}`);
    const photos = (trip.photos ?? []).map((p) => (typeof p === "string" ? { src: p, alt: "" } : { src: p.src, alt: p.alt ?? "" }));
    for (const [i, photo] of photos.entries()) {
      let objectPath = photo.src;
      if (!/^https?:\/\//.test(photo.src)) {
        const local = path.join(root, "public", photo.src.replace(/^\//, ""));
        objectPath = `${slug}/${path.basename(local)}`;
        const { error: upErr } = await db.storage
          .from("photos")
          .upload(objectPath, fs.readFileSync(local), { contentType: types[path.extname(local).toLowerCase()] ?? "image/jpeg", upsert: true });
        must({ error: upErr }, `upload ${objectPath}`);
      }
      must(await db.from("photos").insert({ trip_id: saved.id, path: objectPath, alt: photo.alt, sort: i }), `photo ${objectPath}`);
    }
    console.log(`trip ${slug}: ${photos.length} photos`);
  }
}

console.log("done.");
