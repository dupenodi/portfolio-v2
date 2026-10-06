// What the hero's github hover card shows: the public profile and last year's contribution calendar.
export type ContributionDay = { date: string; count: number; level: number };

export type GitHubCard = {
  login: string;
  name: string;
  location: string | null;
  repos: number;
  followers: number;
  following: number;
  total: number;
  // One column per week, oldest first, sunday on top. Padding before the first day is null.
  weeks: (ContributionDay | null)[][];
};

const DAY = { next: { revalidate: 86400 } };

// The profile, with the token when there is one (a higher rate limit). A token that's expired or revoked makes github
// refuse the request outright, so then it asks again without one: public profiles don't need it.
async function fetchProfile(username: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    const res = await fetch(`https://api.github.com/users/${username}`, { headers: { ...headers, Authorization: `Bearer ${token}` }, ...DAY });
    if (res.status !== 401) return res;
  }
  return fetch(`https://api.github.com/users/${username}`, { headers, ...DAY });
}

export async function getGitHubCard(username = process.env.GITHUB_USERNAME ?? "dupenodi"): Promise<GitHubCard | null> {
  try {
    const [profileRes, calendarRes] = await Promise.all([
      fetchProfile(username),
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, DAY),
    ]);
    if (!profileRes.ok || !calendarRes.ok) return null;

    const profile = await profileRes.json();
    const calendar: { total: { lastYear: number }; contributions: ContributionDay[] } =
      await calendarRes.json();

    // Pad the front so the first column starts on a sunday, the way github lays its grid out.
    const days = calendar.contributions;
    const lead = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
    const cells = [...Array<null>(lead).fill(null), ...days.map(({ date, count, level }) => ({ date, count, level }))];
    const weeks: (ContributionDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return {
      login: profile.login,
      name: profile.name ?? profile.login,
      location: profile.location,
      repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      total: calendar.total.lastYear,
      weeks,
    };
  } catch (error) {
    console.error("[github-card] fetch failed", error);
    return null;
  }
}
