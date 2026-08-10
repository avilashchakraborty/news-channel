import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Called by the backend's onVideoPublished / updateTenantBranding
// (VERCEL_REVALIDATE_URL). Authenticated with a shared secret that must match
// the backend's VERCEL_REVALIDATE_SECRET.
export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  const expected = process.env.VERCEL_REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let paths: string[] = [];
  try {
    const body = (await req.json()) as { paths?: unknown };
    if (Array.isArray(body.paths)) paths = body.paths.filter((p): p is string => typeof p === "string");
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ revalidated: true, paths });
}
