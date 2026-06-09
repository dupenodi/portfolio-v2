import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, verifyGitHubOwnerToken } from "@/lib/github-auth";
import { GITHUB_REPOS_TAG, getGitHubRepos } from "@/lib/github";

async function getToken(request: NextRequest) {
  const fromAuth = getBearerToken(request.headers.get("authorization"));
  if (fromAuth) return fromAuth;

  const fromHeader = request.headers.get("x-github-token")?.trim();
  if (fromHeader) return fromHeader;

  const fromQuery = request.nextUrl.searchParams.get("token")?.trim();
  if (fromQuery) return fromQuery;

  try {
    const body = (await request.json()) as { token?: unknown };
    if (typeof body.token === "string" && body.token.trim()) {
      return body.token.trim();
    }
  } catch {
    // no JSON body
  }

  return null;
}

export async function POST(request: NextRequest) {
  const token = await getToken(request);

  if (!token) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: "missing_token",
        hint: "Use www.dupenodi.dev (not dupenodi.dev) and omit curl --location, or pass token in X-GitHub-Token header / JSON body.",
      },
      { status: 401 }
    );
  }

  const check = await verifyGitHubOwnerToken(token);

  if (!check.ok) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: check.reason,
        ...(check.login ? { login: check.login } : {}),
        expected: check.expected,
        hint:
          check.reason === "invalid_token"
            ? "GitHub rejected the token — create a new classic PAT with read:user scope."
            : `Token belongs to @${check.login}, expected @${check.expected}.`,
      },
      { status: 401 }
    );
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
