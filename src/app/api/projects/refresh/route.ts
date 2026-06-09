import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, isGitHubOwnerToken } from "@/lib/github-auth";
import { GITHUB_REPOS_TAG, getGitHubRepos } from "@/lib/github";

export async function POST(request: NextRequest) {
  const token = getBearerToken(request.headers.get("authorization"));

  if (!token || !(await isGitHubOwnerToken(token))) {
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
