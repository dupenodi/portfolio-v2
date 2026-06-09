import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GITHUB_CONTRIBUTIONS_TAG } from "@/lib/github-contributions";
import { GITHUB_REPOS_TAG } from "@/lib/github";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(GITHUB_REPOS_TAG, { expire: 0 });
  revalidateTag(GITHUB_CONTRIBUTIONS_TAG, { expire: 0 });
  revalidatePath("/projects");
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath("/travel");

  return NextResponse.json({
    revalidated: true,
    paths: ["/", "/projects", "/writing", "/travel"],
    at: new Date().toISOString(),
  });
}
