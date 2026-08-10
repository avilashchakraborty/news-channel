// Best-effort Vercel ISR revalidation (spec §5 onVideoPublished). Rebuilds the
// SEO pages for a video, its district, state and tags. Failures are logged, not
// thrown — a publish must not fail because the web tier is briefly unreachable.
export async function revalidateVercel(url: string, secret: string, paths: string[]): Promise<void> {
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ paths }),
    });
    if (!res.ok) console.error(`Vercel revalidate returned ${res.status}: ${await res.text()}`);
  } catch (e) {
    console.error("Vercel revalidate failed", e);
  }
}

export function videoSeoPaths(input: {
  tenantSlug: string;
  districtId: string;
  stateId: string;
  videoId: string;
  tags: string[];
}): string[] {
  const { tenantSlug, districtId, stateId, videoId, tags } = input;
  return [
    `/${tenantSlug}/video/${videoId}`,
    `/${tenantSlug}/district/${districtId}`,
    `/${tenantSlug}/state/${stateId}`,
    ...tags.map((t) => `/${tenantSlug}/tag/${encodeURIComponent(t)}`),
  ];
}
