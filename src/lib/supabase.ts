import { createClient } from "@supabase/supabase-js";

// Server-only Supabase access. Nothing here is NEXT_PUBLIC_, so neither key reaches the browser.
//
// Public reads use the publishable key (RLS lets it see published rows only) and go through Next's data cache under
// one tag, so the site isn't querying Supabase on every visit. Saving in /admin revalidates the tag.

export const CONTENT_TAG = "content";
export const PHOTOS_BUCKET = "photos";

function env() {
  const url = process.env.SUPABASE_URL?.trim();
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  return { url, publishable, secret };
}

export function supabaseConfigured() {
  const { url, publishable } = env();
  return Boolean(url && publishable);
}

// For the public site. Returns null until the project's env is set, so pages render empty instead of crashing.
export function publicDb() {
  const { url, publishable } = env();
  if (!url || !publishable) return null;
  return createClient(url, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "force-cache", next: { tags: [CONTENT_TAG] } }),
    },
  });
}

// For /admin only, after the session check. The secret key bypasses RLS: it sees drafts and can write.
export function adminDb() {
  const { url, secret } = env();
  if (!url || !secret) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set to use /admin.");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

// Public URL of a photo in the storage bucket.
export function photoUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const { url } = env();
  return `${url}/storage/v1/object/public/${PHOTOS_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
