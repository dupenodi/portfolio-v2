import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GITHUB_REPOS_TAG, getGitHubRepos } from "@/lib/github";

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function POST(request: NextRequest) {
  const expected = process.env.GITHUB_TOKEN;
  const token = getBearerToken(request);

  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(GITHUB_REPOS_TAG, { expire: 0 });
  revalidatePath("/projects");

  const repos = await getGitHubRepos(undefined, { fresh: true });

  return NextResponse.json({
    refreshed: true,
    count: repos.length,
    projects: repos.map((repo) => repo.name),
    at: new Date().toISOString(),
  });
}
