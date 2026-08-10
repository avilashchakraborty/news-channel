import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { REGION } from "../config";
import { db, FieldValue, Timestamp } from "../lib/firestore";
import { getMembership } from "../lib/auth";
import { hamming } from "../lib/simhash";
import { Video } from "../types";

const MIN_SEC = 8;
const MAX_SEC = 90;
const DUP_WINDOW_MS = 48 * 3_600_000;
const SIMILAR_WINDOW_MS = 6 * 3_600_000;
const DUP_HAMMING = 3;
const AUTO_PUBLISH_TRUST = 85;

/**
 * Fires when a video transitions into `pending` (spec §5). Runs the auto-flag
 * pass, then either auto-publishes (trust ≥ 85 and no flags — this is what keeps
 * the queue survivable at scale) or drops a moderationQueue entry.
 */
export const onVideoPending = onDocumentWritten(
  { region: REGION, document: "videos/{videoId}" },
  async (event) => {
    const before = event.data?.before.data() as Video | undefined;
    const after = event.data?.after.data() as Video | undefined;
    if (!after) return;
    // Only act on the transition INTO pending (idempotent, no self-retrigger).
    if (after.status !== "pending" || before?.status === "pending") return;

    const videoId = event.params.videoId;
    const flags = await computeAutoFlags(videoId, after);

    const membership = await getMembership(after.creatorId, after.tenantId);
    const trust = membership?.trustScore ?? 0;

    if (trust >= AUTO_PUBLISH_TRUST && flags.length === 0) {
      await autoPublish(videoId, after, flags);
      return;
    }

    await queueForReview(videoId, after, flags);
  },
);

async function computeAutoFlags(videoId: string, v: Video): Promise<string[]> {
  const flags: string[] = [];

  const meta = (v as unknown as { encodeMeta?: { hasAudio: boolean | null } }).encodeMeta;
  if (meta && meta.hasAudio === false) flags.push("NO_AUDIO");

  if (typeof v.durationSec === "number") {
    if (v.durationSec < MIN_SEC) flags.push("TOO_SHORT");
    else if (v.durationSec > MAX_SEC) flags.push("TOO_LONG");
  }

  const now = Date.now();

  // DUPLICATE: near-identical headline in the same district in the last 48h.
  const dupSnap = await db
    .collection("videos")
    .where("districtId", "==", v.districtId)
    .where("createdAt", ">=", Timestamp.fromMillis(now - DUP_WINDOW_MS))
    .get();
  const isDuplicate = dupSnap.docs.some(
    (d) => d.id !== videoId && typeof d.get("titleHash") === "string" && hamming(v.titleHash, d.get("titleHash")) <= DUP_HAMMING,
  );
  if (isDuplicate) flags.push("DUPLICATE");

  // SIMILAR: 3+ recent videos sharing at least one tag in the same district.
  if (v.tags.length > 0) {
    const simSnap = await db
      .collection("videos")
      .where("districtId", "==", v.districtId)
      .where("tags", "array-contains-any", v.tags.slice(0, 10))
      .where("createdAt", ">=", Timestamp.fromMillis(now - SIMILAR_WINDOW_MS))
      .get();
    const overlapping = simSnap.docs.filter((d) => d.id !== videoId).length;
    if (overlapping >= 3) flags.push("SIMILAR");
  }

  return flags;
}

async function autoPublish(videoId: string, v: Video, flags: string[]): Promise<void> {
  const batch = db.batch();
  batch.update(db.doc(`videos/${videoId}`), {
    autoFlags: flags,
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("moderationActions").doc(), {
    videoId,
    tenantId: v.tenantId,
    districtId: v.districtId,
    moderatorId: "system",
    action: "auto_approve",
    reason: null,
    note: `Auto-approved: trust ≥ ${AUTO_PUBLISH_TRUST}, no flags.`,
    trustDelta: 0,
    at: FieldValue.serverTimestamp(),
  });
  // A `done` queue row keeps the audit view complete without adding review load.
  batch.set(db.doc(`moderationQueue/${videoId}`), {
    videoId,
    tenantId: v.tenantId,
    districtId: v.districtId,
    creatorId: v.creatorId,
    headline: v.headline,
    thumbnailUrl: v.thumbnailUrl,
    durationSec: v.durationSec ?? 0,
    autoFlags: flags,
    status: "done",
    claimedBy: null,
    claimedUntil: null,
    submittedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

async function queueForReview(videoId: string, v: Video, flags: string[]): Promise<void> {
  const batch = db.batch();
  batch.update(db.doc(`videos/${videoId}`), { autoFlags: flags });
  batch.set(db.doc(`moderationQueue/${videoId}`), {
    videoId,
    tenantId: v.tenantId,
    districtId: v.districtId,
    creatorId: v.creatorId,
    headline: v.headline,
    thumbnailUrl: v.thumbnailUrl,
    durationSec: v.durationSec ?? 0,
    autoFlags: flags,
    status: "waiting",
    claimedBy: null,
    claimedUntil: null,
    submittedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
}
