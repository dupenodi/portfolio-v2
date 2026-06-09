#!/usr/bin/env node
/**
 * Manually refresh cached GitHub projects on the live or local site.
 *
 * Usage:
 *   REVALIDATE_SECRET=your-secret SITE_URL=https://dupenodi.dev npm run refresh:github
 *   REVALIDATE_SECRET=your-secret npm run refresh:github   # defaults to http://localhost:3000
 */

const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.REVALIDATE_SECRET;

if (!secret) {
  console.error("Missing REVALIDATE_SECRET. Add it to .env.local — see .env.example");
  process.exit(1);
}

const endpoint = `${siteUrl}/api/revalidate?secret=${encodeURIComponent(secret)}`;

const res = await fetch(endpoint, { method: "POST" });

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Revalidate failed:", res.status, body);
  process.exit(1);
}

console.log("GitHub project cache refreshed:", body);
