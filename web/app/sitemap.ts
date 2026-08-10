import type { MetadataRoute } from "next";
import { getVideos, slug } from "./lib/data";
import { REGIONS, CHIPS } from "./lib/types";

const BASE = "https://news-channel-one.vercel.app";
const TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "gplus";
const STATES = new Set(["West Bengal", "Bihar", "Jharkhand", "Delhi", "National"]);

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [{ url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 }];

  for (const r of REGIONS) {
    const path = STATES.has(r)
      ? `/${TENANT}/state/${slug(r === "National" ? "India" : r)}`
      : `/${TENANT}/district/${slug(r)}`;
    entries.push({ url: `${BASE}${path}`, lastModified: now, changeFrequency: "hourly", priority: 0.8 });
  }

  for (const c of CHIPS) {
    entries.push({ url: `${BASE}/${TENANT}/tag/${slug(c)}`, lastModified: now, changeFrequency: "daily", priority: 0.6 });
  }

  const videos = await getVideos({ tenantId: TENANT, limit: 100 });
  for (const v of videos) {
    entries.push({ url: `${BASE}/video/${v.id}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  }

  return entries;
}
