export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export async function getBlogPosts(feedUrl: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio/1.0)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const xml = await res.text();

    // BearBlog uses Atom format — entries not items
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

    return entries.map((entry) => ({
      title: decode(extractText(entry, "title")),
      link: extractAtomLink(entry),
      pubDate: extractText(entry, "published") || extractText(entry, "updated"),
      description: decode(stripTags(extractContent(entry))).slice(0, 180).trimEnd() + "…",
    }));
  } catch {
    return [];
  }
}

function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return (m?.[1] ?? "").trim();
}

function extractAtomLink(entry: string): string {
  // <link href="..." rel="alternate"/>
  const m = entry.match(/<link[^>]*href="([^"]*)"[^>]*rel="alternate"/);
  if (m) return m[1];
  // fallback: first href
  const m2 = entry.match(/<link[^>]*href="([^"]*)"/);
  return m2?.[1] ?? "";
}

function extractContent(entry: string): string {
  const m = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/);
  return m?.[1] ?? extractText(entry, "summary");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decode(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#13;/g, "");
}
