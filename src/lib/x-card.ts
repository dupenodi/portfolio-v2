// What the hero's x hover card shows, from x's public profile (through fxtwitter's api, since x's own needs a paid
// key). If the fetch fails, the card falls back to this snapshot from sep 2026.
export type XCard = {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  verified: boolean;
  followers: number;
  following: number;
};

const SNAPSHOT: XCard = {
  name: "sharathhh",
  handle: "dupenodi",
  bio: "http://dupenodi.dev/resume.pdf\n\npls hire me\n\nfullstack engg. excellent design & product thinking. intern - tech lead at http://niti.ai",
  avatar: "https://pbs.twimg.com/profile_images/2061743997543174144/ZD2-0DLt_400x400.jpg",
  verified: true,
  followers: 71,
  following: 355,
};

export async function getXCard(handle = "dupenodi"): Promise<XCard> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/${handle}`, { next: { revalidate: 86400 } });
    if (!res.ok) return SNAPSHOT;
    const { user } = await res.json();
    if (!user) return SNAPSHOT;
    return {
      name: user.name,
      handle: user.screen_name,
      bio: user.description ?? "",
      // The api hands back the 48px thumbnail; the same path serves the 400px one.
      avatar: String(user.avatar_url).replace("_normal.", "_400x400."),
      verified: Boolean(user.verification?.verified),
      followers: user.followers,
      following: user.following,
    };
  } catch (error) {
    console.error("[x-card] fetch failed", error);
    return SNAPSHOT;
  }
}
