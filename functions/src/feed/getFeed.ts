import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import {
  callableBase,
  BUNNY_STREAM_CDN_HOSTNAME,
  BUNNY_TOKEN_AUTH_KEY,
} from "../config";
import { db } from "../lib/firestore";
import { parseInput } from "../lib/validate";
import { signedPlaybackUrl, BunnyConfig } from "../lib/bunny";
import { Video } from "../types";

const PAGE = 10;
const PLAYBACK_TTL_MS = 4 * 3_600_000; // 4h (spec §6)
const CACHE_TTL_MS = 60_000; // 60s hot-district cache (spec §7)
const IN_LIMIT = 10; // Firestore `in` cap (spec §5)

const Input = z.object({
  tenantId: z.string().min(1).default("gplus"),
  districtId: z.string().min(1),
  scope: z.enum(["district", "state", "national"]).default("district"),
  cursor: z.number().nullable().default(null), // last rankScore seen
  limit: z.number().int().min(1).max(20).default(PAGE),
});

// Per-instance cache of the first page for the hottest districts. Feed data is
// eventually consistent; a 60s window is fine and slashes reads.
type CacheEntry = { at: number; payload: unknown };
const firstPageCache = new Map<string, CacheEntry>();

function feedFields(id: string, v: Video, cfg: BunnyConfig, tokenKey: string | null) {
  let playback = v.playbackUrl;
  if (tokenKey && v.bunnyVideoId) {
    try {
      playback = signedPlaybackUrl(cfg, v.bunnyVideoId, tokenKey, PLAYBACK_TTL_MS);
    } catch {
      /* fall back to unsigned */
    }
  }
  return {
    id,
    headline: v.headline,
    creatorHandle: v.creatorHandle,
    creatorName: v.creatorName,
    creatorVerified: v.creatorVerified,
    districtId: v.districtId,
    category: v.category,
    tags: v.tags,
    language: v.language,
    thumbnailUrl: v.thumbnailUrl,
    playbackUrl: playback,
    durationSec: v.durationSec,
    viewCount: v.viewCount,
    likeCount: v.likeCount,
    commentCount: v.commentCount,
    isLive: v.isLive,
    rankScore: v.rankScore,
    publishedAt: v.publishedAt?.toMillis() ?? null,
  };
}

async function districtIdsFor(tenantId: string, districtId: string, scope: string): Promise<string[]> {
  if (scope === "district") return [districtId];

  if (scope === "state") {
    const anchor = await db.doc(`districts/${districtId}`).get();
    const stateId = (anchor.get("stateId") as string) ?? null;
    if (!stateId) return [districtId];
    const snap = await db
      .collection("districts")
      .where("tenantId", "==", tenantId)
      .where("stateId", "==", stateId)
      .get();
    return snap.docs.map((d) => d.id);
  }

  // national: every active district in the tenant.
  const snap = await db.collection("districts").where("tenantId", "==", tenantId).get();
  return snap.docs.map((d) => d.id);
}

/**
 * The public feed (spec §5). Published videos in scope, ordered by rankScore,
 * 10 per page with a rankScore cursor, live videos injected at the top. Returns
 * only the fields the feed renders — never whole documents.
 */
export const getFeed = onCall(
  { ...callableBase, secrets: [BUNNY_TOKEN_AUTH_KEY] },
  async (req) => {
    const { tenantId, districtId, scope, cursor, limit } = parseInput(Input, req.data);

    const cacheKey = `${tenantId}|${scope}|${districtId}`;
    if (cursor === null) {
      const hit = firstPageCache.get(cacheKey);
      if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.payload;
    }

    const cfg: BunnyConfig = {
      libraryId: "",
      apiKey: "",
      cdnHostname: BUNNY_STREAM_CDN_HOSTNAME.value(),
    };
    let tokenKey: string | null = null;
    try {
      tokenKey = BUNNY_TOKEN_AUTH_KEY.value() || null;
    } catch {
      tokenKey = null;
    }

    const districtIds = await districtIdsFor(tenantId, districtId, scope);
    if (districtIds.length === 0) throw new HttpsError("not-found", "No districts in scope.");

    // Firestore `in` caps at 10 — for wider scope, run parallel queries and merge.
    const chunks: string[][] = [];
    for (let i = 0; i < districtIds.length; i += IN_LIMIT) chunks.push(districtIds.slice(i, i + IN_LIMIT));

    const runChunk = async (ids: string[]) => {
      let q = db
        .collection("videos")
        .where("tenantId", "==", tenantId)
        .where("districtId", "in", ids)
        .where("status", "==", "published")
        .orderBy("rankScore", "desc")
        .limit(limit);
      if (cursor !== null) q = q.startAfter(cursor);
      return (await q.get()).docs;
    };

    const merged = (await Promise.all(chunks.map(runChunk))).flat();
    // Merge parallel chunks by rankScore, de-dupe, take the page.
    const seen = new Set<string>();
    const ranked = merged
      .filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
      .sort((a, b) => (b.get("rankScore") as number) - (a.get("rankScore") as number))
      .slice(0, limit);

    // Inject live videos at the very top (only on the first page).
    let liveDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    if (cursor === null) {
      const liveSnap = await db
        .collection("videos")
        .where("tenantId", "==", tenantId)
        .where("status", "==", "published")
        .where("isLive", "==", true)
        .orderBy("publishedAt", "desc")
        .limit(5)
        .get();
      liveDocs = liveSnap.docs.filter((d) => districtIds.includes(d.get("districtId")));
    }

    const ordered = [...liveDocs, ...ranked.filter((d) => !liveDocs.some((l) => l.id === d.id))];
    const items = ordered.map((d) => feedFields(d.id, d.data() as Video, cfg, tokenKey));
    const nextCursor = ranked.length === limit ? (ranked[ranked.length - 1].get("rankScore") as number) : null;

    const payload = { items, nextCursor };
    if (cursor === null) firstPageCache.set(cacheKey, { at: Date.now(), payload });
    return payload;
  },
);

export type FeedItem = ReturnType<typeof feedFields>;
