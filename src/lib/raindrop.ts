export interface Bookmark {
  _id: number;
  title: string;
  excerpt: string;
  link: string;
  domain: string;
  tags: string[];
  created: string;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const token = process.env.RAINDROP_TOKEN;
  const collectionId = process.env.RAINDROP_COLLECTION_ID ?? "0"; // 0 = all bookmarks

  if (!token) return [];

  try {
    const search = encodeURIComponent(JSON.stringify([{ key: "tag", val: "portfolio" }]));
    const res = await fetch(
      `https://api.raindrop.io/rest/v1/raindrops/${collectionId}?perpage=50&sort=-created&search=${search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}
