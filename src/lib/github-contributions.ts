import { getGitHubRevalidateSeconds, getGitHubUsername } from "@/lib/env";

export const GITHUB_CONTRIBUTIONS_TAG = "github-contributions";

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionCalendar = {
  total: number;
  weeks: ContributionDay[][];
};

const LEVEL_MAP: Record<ContributionLevel, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const CONTRIBUTIONS_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: ContributionLevel;
            }[];
          }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
};

export async function getGitHubContributions(
  username = getGitHubUsername()
): Promise<ContributionCalendar | null> {
  const fromGraphQL = await fetchContributionsGraphQL(username);
  if (fromGraphQL) return fromGraphQL;
  return fetchContributionsFallback(username);
}

async function fetchContributionsGraphQL(username: string): Promise<ContributionCalendar | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { username },
      }),
      next: {
        revalidate: getGitHubRevalidateSeconds(),
        tags: [GITHUB_CONTRIBUTIONS_TAG],
      },
    });

    if (!res.ok) {
      console.error("[github-contributions] graphql failed", res.status);
      return null;
    }

    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) {
      console.error("[github-contributions] graphql errors", json.errors[0]?.message);
      return null;
    }

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    return {
      total: calendar.totalContributions,
      weeks: mapWeeks(calendar.weeks),
    };
  } catch (error) {
    console.error("[github-contributions] graphql error", error);
    return null;
  }
}

type FallbackDay = {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
};

type FallbackResponse = {
  totalContributions: number;
  contributions: FallbackDay[][];
};

async function fetchContributionsFallback(username: string): Promise<ContributionCalendar | null> {
  try {
    const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`, {
      next: {
        revalidate: getGitHubRevalidateSeconds(),
        tags: [GITHUB_CONTRIBUTIONS_TAG],
      },
    });

    if (!res.ok) {
      console.error("[github-contributions] fallback failed", res.status);
      return null;
    }

    const json = (await res.json()) as FallbackResponse;
    if (!json.contributions?.length) return null;

    return {
      total: json.totalContributions,
      weeks: json.contributions.map((week) =>
        week.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: LEVEL_MAP[day.contributionLevel] ?? 0,
        }))
      ),
    };
  } catch (error) {
    console.error("[github-contributions] fallback error", error);
    return null;
  }
}

function mapWeeks(
  weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
      contributionLevel: ContributionLevel;
    }[];
  }[]
): ContributionDay[][] {
  return weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel] ?? 0,
    }))
  );
}

/** Month labels aligned to week columns (like GitHub's calendar header). */
export function getContributionMonthLabels(weeks: ContributionCalendar["weeks"]): string[] {
  const labels: string[] = [];
  let lastMonth = -1;

  for (const week of weeks) {
    const firstDay = week[0];
    if (!firstDay) {
      labels.push("");
      continue;
    }

    const month = new Date(`${firstDay.date}T12:00:00`).getMonth();
    if (month !== lastMonth) {
      labels.push(
        new Date(`${firstDay.date}T12:00:00`).toLocaleString("en", { month: "short" }).toLowerCase()
      );
      lastMonth = month;
    } else {
      labels.push("");
    }
  }

  return labels;
}
