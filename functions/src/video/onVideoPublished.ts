import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { REGION, VERCEL_REVALIDATE_URL, VERCEL_REVALIDATE_SECRET } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { getMembership } from "../lib/auth";
import { computeRankScore } from "../lib/ranking";
import { notifyFollowers } from "../lib/notify";
import { revalidateVercel, videoSeoPaths } from "../lib/revalidate";
import { Video, Tenant, District } from "../types";

/**
 * Fires when a video transitions into `published` (spec §5): seed rankScore,
 * bump districts.videoCount, fan a push out to followers (batched at 500), and
 * rebuild the SEO pages for the video, its district, state and tags.
 */
export const onVideoPublished = onDocumentWritten(
  { region: REGION, document: "videos/{videoId}", secrets: [VERCEL_REVALIDATE_SECRET] },
  async (event) => {
    const before = event.data?.before.data() as Video | undefined;
    const after = event.data?.after.data() as Video | undefined;
    if (!after) return;
    if (after.status !== "published" || before?.status === "published") return;

    const videoId = event.params.videoId;

    const membership = await getMembership(after.creatorId, after.tenantId);
    const rankScore = computeRankScore({
      views: after.viewCount,
      likes: after.likeCount,
      comments: after.commentCount,
      creatorTrust: membership?.trustScore ?? 50,
      publishedAtMs: after.publishedAt?.toMillis() ?? Date.now(),
      nowMs: Date.now(),
    });

    await db.doc(`videos/${videoId}`).update({ rankScore });
    await db
      .doc(`districts/${after.districtId}`)
      .set({ videoCount: FieldValue.increment(1) }, { merge: true });

    // Fan out to followers (best-effort).
    await notifyFollowers(
      after.creatorId,
      `${after.creatorName} posted`,
      after.headline,
      { videoId, kind: "new_video" },
    );

    // Rebuild SEO pages.
    const [tenantSnap, districtSnap] = await Promise.all([
      db.doc(`tenants/${after.tenantId}`).get(),
      db.doc(`districts/${after.districtId}`).get(),
    ]);
    const tenant = tenantSnap.data() as Tenant | undefined;
    const district = districtSnap.data() as District | undefined;
    await revalidateVercel(VERCEL_REVALIDATE_URL.value(), VERCEL_REVALIDATE_SECRET.value(), videoSeoPaths({
      tenantSlug: tenant?.slug ?? after.tenantId,
      districtId: after.districtId,
      stateId: district?.stateId ?? "unknown",
      videoId,
      tags: after.tags,
    }));
  },
);
