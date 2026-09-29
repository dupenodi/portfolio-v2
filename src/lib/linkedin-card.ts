import { site } from "@/lib/site";

// What the hero's linkedin hover card shows. Linkedin walls off profiles from scripts but hands the public summary to
// link-preview crawlers (slack, discord, whatsapp), so this asks the way slack does and reads the page's meta tags.
// Linkedin rate-limits that too, sometimes, so there's a snapshot (sep 2026) to fall back on.
export type LinkedInCard = {
  name: string;
  headline: string | null;
  about: string | null;
  company: string | null;
  school: string | null;
  location: string | null;
  connections: string | null;
  followers: number | null;
  photo: string | null;
  banner: string | null;
};

const SNAPSHOT: LinkedInCard = {
  name: "Sarath Donepudi",
  headline: null,
  about: "prev founding engineer @ niti.ai. spent the last few years building AI-first products from 0 to…",
  company: "prev · Niti AI",
  school: "SSN College of Engineering",
  location: "Bengaluru",
  connections: "500+",
  followers: null,
  photo: null,
  banner: null,
};

// Link-preview crawlers linkedin serves the public profile to. It rate-limits them one by one, so when one is turned
// away (429, or its own 999) the next gets a try.
const CRAWLERS = [
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  "WhatsApp/2.23.20.0",
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
];

// The first crawler's answer is cached for a day like the other cards; a retry after a refusal isn't cached, so a
// rate limit doesn't pin the fallback in place for the day.
async function fetchProfile(url: string) {
  for (const [i, agent] of CRAWLERS.entries()) {
    const res = await fetch(url, {
      headers: { "User-Agent": agent, "Accept-Language": "en-US,en" },
      ...(i === 0 ? { next: { revalidate: 86400 } } : { cache: "no-store" as const }),
    });
    if (res.ok) return res;
  }
  return null;
}

function decode(text: string) {
  // Linkedin double-escapes apostrophes (&amp;#39;), so unescape until nothing changes.
  let out = text;
  for (let i = 0; i < 3; i++) {
    const next = out
      .replace(/&amp;/g, "&")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
    if (next === out) break;
    out = next;
  }
  return out.trim();
}

function meta(html: string, key: string) {
  const match =
    html.match(new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]*)"`, "i")) ??
    html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${key}"`, "i"));
  return match ? decode(match[1]) : null;
}

function text(html: string, className: string) {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</`, "i"));
  return match ? decode(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) || null : null;
}

// Profile photos and banners are served from media.licdn.com; the first url of each kind on the page is the member's.
function image(html: string, kind: "profile-displayphoto" | "profile-displaybackgroundimage") {
  const match = html.match(new RegExp(`https://media\\.licdn\\.com/dms/image/[^"'\\s]*${kind}[^"'\\s]*`));
  return match ? decode(match[0]) : null;
}

type Person = {
  name?: string;
  jobTitle?: string[] | string;
  description?: string;
  image?: { contentUrl?: string };
  address?: { addressLocality?: string };
  worksFor?: { name?: string }[];
  alumniOf?: { name?: string }[];
  interactionStatistic?: { userInteractionCount?: number } | { userInteractionCount?: number }[];
};

// The full public profile (what crawlers get when linkedin's in a good mood) carries a schema.org Person.
function person(html: string): Person | null {
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(match[1]);
      const nodes: { "@type"?: string }[] = json["@graph"] ?? [json];
      const found = nodes.find((n) => n["@type"] === "Person");
      if (found) return found as Person;
    } catch {}
  }
  return null;
}

export async function getLinkedInCard(url = site.linkedin): Promise<LinkedInCard> {
  try {
    const res = await fetchProfile(url.replace("/comm/", "/"));
    if (!res) return SNAPSHOT;
    const html = await res.text();
    const description = meta(html, "og:description") ?? meta(html, "description") ?? "";
    if (!description && !person(html)) return SNAPSHOT;

    // "about… · Experience: Niti AI · Education: SSN College of Engineering · Location: Bengaluru · 500+ connections
    // on LinkedIn. View …'s profile on LinkedIn, …"
    const parts = description.split(" · ");
    const field = (label: string) =>
      parts.find((p) => p.startsWith(`${label}: `))?.slice(label.length + 2).trim() ?? null;
    const connections = description.match(/([\d,]+\+?) connections/)?.[1] ?? null;
    const about = parts[0] && !/^(Experience|Education|Location):/.test(parts[0]) ? parts[0] : null;

    // The title reads "Name - Headline | LinkedIn" (or "Name - Company | LinkedIn" when there's no headline).
    const title = (meta(html, "og:title") ?? html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").replace(/\s*\|\s*LinkedIn\s*$/, "");
    const [name, ...rest] = decode(title).split(" - ");
    const headline = rest.join(" - ").trim() || null;
    const company = field("Experience");

    const og = meta(html, "og:image");
    const p = person(html);
    const stat = Array.isArray(p?.interactionStatistic) ? p.interactionStatistic[0] : p?.interactionStatistic;
    const followers =
      stat?.userInteractionCount ?? Number(html.match(/([\d,]+) followers/)?.[1]?.replace(/,/g, "") || NaN);
    const topHeadline = text(html, "top-card-layout__headline");
    const job = Array.isArray(p?.jobTitle) ? p.jobTitle[0] : p?.jobTitle;
    const bestHeadline = topHeadline ?? headline ?? job ?? null;
    const bestCompany = p?.worksFor?.[0]?.name ?? company;

    return {
      name: p?.name ?? text(html, "top-card-layout__title") ?? (name?.trim() || SNAPSHOT.name),
      // A headline that's just the company name says nothing the company row doesn't.
      headline: bestHeadline && bestHeadline !== bestCompany ? bestHeadline : null,
      about: p?.description ? decode(p.description) : about,
      company: bestCompany,
      school: p?.alumniOf?.[0]?.name ?? field("Education"),
      location: p?.address?.addressLocality ?? field("Location"),
      connections,
      followers: Number.isFinite(followers) ? followers : null,
      // Linkedin's placeholder silhouette isn't worth showing over the fallback photo.
      photo: p?.image?.contentUrl ?? image(html, "profile-displayphoto") ?? (og?.includes("media.licdn.com/dms/image") ? og : null),
      banner: image(html, "profile-displaybackgroundimage"),
    };
  } catch (error) {
    console.error("[linkedin-card] fetch failed", error);
    return SNAPSHOT;
  }
}
