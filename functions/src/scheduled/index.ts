import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  REGION,
  BUNNY_STREAM_API_KEY,
  BUNNY_STREAM_LIBRARY_ID,
  BUNNY_STREAM_CDN_HOSTNAME,
} from "../config";
import { db, FieldValue, Timestamp } from "../lib/firestore";
import { sumShards } from "../lib/shards";
import { computeRankScore } from "../lib/ranking";
import { commitInChunks } from "../lib/batch";
import { BunnyConfig, deleteBunnyVideo } from "../lib/bunny";
import { getMembership } from "../lib/auth";
import { Video } from "../types";

const HOT_WINDOW_MS = 7 * 86_400_000;
const RANK_WINDOW_MS = 72 * 3_600_000;

function bunnyCfg(): BunnyConfig {
  return {
    libraryId: BUNNY_STREAM_LIBRARY_ID.value(),
    apiKey: BUNNY_STREAM_API_KEY.value(),
    cdnHostname: BUNNY_STREAM_CDN_HOSTNAME.value(),
  };
}

// Sum view/like/comment shards into the parent document (spec §7).
export const aggregateCounters = onSchedule(
  { region: REGION, schedule: "every 5 minutes" },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - HOT_WINDOW_MS);
    const snap = await db
      .collection("videos")
      .where("status", "==", "published")
      .where("publishedAt", ">=", cutoff)
      .limit(500)
      .get();

    const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];
    for (const doc of snap.docs) {
      const [views, likes, comments] = await Promise.all([
        sumShards(doc.id, "viewShards"),
        sumShards(doc.id, "likeShards"),
        sumShards(doc.id, "commentShards"),
      ]);
      const v = doc.data() as Video;
      if (v.viewCount !== views || v.likeCount !== Math.max(0, likes) || v.commentCount !== comments) {
        ops.push((b) =>
          b.update(doc.ref, {
            viewCount: views,
            likeCount: Math.max(0, likes),
            commentCount: comments,
          }),
        );
      }
    }
    await commitInChunks(ops);
  },
);

// Recompute rankScore for videos published in the last 72h (spec §5).
export const recomputeRankScores = onSchedule(
  { region: REGION, schedule: "every 60 minutes" },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - RANK_WINDOW_MS);
    const snap = await db
      .collection("videos")
      .where("status", "==", "published")
      .where("publishedAt", ">=", cutoff)
      .limit(1000)
      .get();

    const now = Date.now();
    const trustCache = new Map<string, number>();
    const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];
    for (const doc of snap.docs) {
      const v = doc.data() as Video;
      const key = `${v.creatorId}_${v.tenantId}`;
      let trust = trustCache.get(key);
      if (trust === undefined) {
        trust = (await getMembership(v.creatorId, v.tenantId))?.trustScore ?? 50;
        trustCache.set(key, trust);
      }
      const rankScore = computeRankScore({
        views: v.viewCount,
        likes: v.likeCount,
        comments: v.commentCount,
        creatorTrust: trust,
        publishedAtMs: v.publishedAt?.toMillis() ?? now,
        nowMs: now,
      });
      ops.push((b) => b.update(doc.ref, { rankScore }));
    }
    await commitInChunks(ops);
  },
);

// Release soft locks whose claimedUntil has passed (spec §5).
export const releaseStaleClaims = onSchedule(
  { region: REGION, schedule: "every 5 minutes" },
  async () => {
    const snap = await db
      .collection("moderationQueue")
      .where("status", "==", "in_review")
      .where("claimedUntil", "<", Timestamp.now())
      .get();
    const ops = snap.docs.map((d) => (b: FirebaseFirestore.WriteBatch) =>
      b.update(d.ref, { status: "waiting", claimedBy: null, claimedUntil: null }),
    );
    await commitInChunks(ops);
  },
);

// Delete encoding videos older than 2h and their Bunny objects (spec §5).
export const expireUploadTickets = onSchedule(
  { region: REGION, schedule: "every 60 minutes", secrets: [BUNNY_STREAM_API_KEY] },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 2 * 3_600_000);
    const snap = await db
      .collection("videos")
      .where("status", "==", "encoding")
      .where("createdAt", "<", cutoff)
      .get();
    const cfg = bunnyCfg();
    for (const doc of snap.docs) {
      const bunnyId = doc.get("bunnyVideoId") as string | undefined;
      if (bunnyId) {
        try {
          await deleteBunnyVideo(cfg, bunnyId);
        } catch (e) {
          console.error("Bunny delete failed", e);
        }
      }
      await doc.ref.delete();
    }
  },
);

// Daily rollups for the admin console (spec §5), at 00:15 IST.
export const rollupDailyStats = onSchedule(
  { region: REGION, schedule: "15 0 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const dayStart = Timestamp.fromMillis(Date.now() - 86_400_000);

    const tenants = await db.collection("tenants").get();
    const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];
    for (const t of tenants.docs) {
      const tenantId = t.id;
      const [published, reporters] = await Promise.all([
        db.collection("videos").where("tenantId", "==", tenantId).where("status", "==", "published").where("publishedAt", ">=", dayStart).get(),
        db.collection("memberships").where("tenantId", "==", tenantId).where("role", "==", "reporter").where("status", "==", "active").get(),
      ]);
      let views = 0;
      published.forEach((d) => (views += (d.get("viewCount") as number) ?? 0));
      ops.push((b) =>
        b.set(db.doc(`stats/${tenantId}_${date}`), {
          tenantId,
          date,
          publishedToday: published.size,
          activeReporters: reporters.size,
          viewsToday: views,
          at: FieldValue.serverTimestamp(),
        }),
      );
    }
    await commitInChunks(ops);
  },
);

// Weekly: nudge reporter trust scores toward 50 by 2 points (spec §5).
export const decayTrustScores = onSchedule(
  { region: REGION, schedule: "every 168 hours" },
  async () => {
    const snap = await db
      .collection("memberships")
      .where("role", "==", "reporter")
      .where("status", "==", "active")
      .get();
    const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];
    for (const d of snap.docs) {
      const trust = (d.get("trustScore") as number) ?? 50;
      if (trust === 50) continue;
      const next = trust > 50 ? Math.max(50, trust - 2) : Math.min(50, trust + 2);
      ops.push((b) => b.update(d.ref, { trustScore: next }));
    }
    await commitInChunks(ops);
  },
);

// Daily: hard-delete media for accounts soft-deleted 30+ days ago (spec §5).
export const purgeDeletedAccounts = onSchedule(
  { region: REGION, schedule: "every 24 hours", secrets: [BUNNY_STREAM_API_KEY] },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 30 * 86_400_000);
    const users = await db.collection("users").where("deletedAt", "<", cutoff).get();
    const cfg = bunnyCfg();
    for (const u of users.docs) {
      const videos = await db.collection("videos").where("creatorId", "==", u.id).get();
      for (const v of videos.docs) {
        const bunnyId = v.get("bunnyVideoId") as string | undefined;
        if (bunnyId) {
          try {
            await deleteBunnyVideo(cfg, bunnyId);
          } catch (e) {
            console.error("Bunny delete failed", e);
          }
        }
      }
      await u.ref.update({ purgedAt: FieldValue.serverTimestamp() });
    }
  },
);

// Every 5 min: sum ad impression/click shards into ads and roll up to
// campaigns, computing spend (CPM ₹50 / 1000 + CPC ₹2). Mirrors the video
// counter strategy so hot ads stay under the per-document write ceiling.
export const aggregateAdCounters = onSchedule(
  { region: REGION, schedule: "every 5 minutes" },
  async () => {
    const ads = await db.collection("ads").limit(500).get();
    const campaignAgg = new Map<string, { imp: number; clk: number }>();
    const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];

    for (const doc of ads.docs) {
      const [imp, clk] = await Promise.all([sumAdShards(doc.id, "impShards"), sumAdShards(doc.id, "clickShards")]);
      if ((doc.get("impressions") as number) !== imp || (doc.get("clicks") as number) !== clk) {
        ops.push((b) => b.update(doc.ref, { impressions: imp, clicks: clk }));
      }
      const cid = doc.get("campaignId") as string;
      const agg = campaignAgg.get(cid) ?? { imp: 0, clk: 0 };
      agg.imp += imp;
      agg.clk += clk;
      campaignAgg.set(cid, agg);
    }

    for (const [cid, agg] of campaignAgg) {
      const spend = Math.round((agg.imp / 1000) * 50 + agg.clk * 2);
      ops.push((b) => b.set(db.doc(`campaigns/${cid}`), { impressions: agg.imp, clicks: agg.clk, spend }, { merge: true }));
    }
    await commitInChunks(ops);
  },
);

async function sumAdShards(adId: string, kind: "impShards" | "clickShards"): Promise<number> {
  const snap = await db.collection(`ads/${adId}/${kind}`).get();
  let total = 0;
  snap.forEach((d) => (total += (d.data().count as number) ?? 0));
  return total;
}

// Every 10 min: end live streams whose Bunny source has stopped (spec §5).
// Heuristic without a live-status API: expire isLive videos older than 2h.
export const endStaleLiveStreams = onSchedule(
  { region: REGION, schedule: "every 10 minutes" },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 2 * 3_600_000);
    const snap = await db
      .collection("videos")
      .where("isLive", "==", true)
      .where("publishedAt", "<", cutoff)
      .get();
    const ops = snap.docs.map((d) => (b: FirebaseFirestore.WriteBatch) => b.update(d.ref, { isLive: false }));
    await commitInChunks(ops);
  },
);
