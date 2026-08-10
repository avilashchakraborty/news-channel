import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireScope, membershipId } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { QueueItem, Video } from "../types";

const Input = z.object({
  videoId: z.string().min(1),
  action: z.enum(["approve", "reject", "escalate", "remove"]),
  reason: z.string().trim().max(200).nullable().default(null),
  note: z.string().trim().max(1000).nullable().default(null),
  adjustTrust: z.boolean().default(true),
});

const TRUST_FLOOR = 0;
const TRUST_CEIL = 100;

function trustDeltaFor(action: string): number {
  if (action === "approve") return 2;
  if (action === "reject") return -8;
  return 0;
}

/**
 * The moderation decision (spec §5). One transaction updates videos.status,
 * writes an immutable moderationActions entry, marks the queue item done, and
 * adjusts the creator's trustScore and published/rejected counts. Rejects if the
 * queue item is claimed by another moderator whose lock hasn't expired.
 */
export const moderateVideo = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { videoId, action, reason, note, adjustTrust } = parseInput(Input, req.data);

  const videoRef = db.doc(`videos/${videoId}`);
  const queueRef = db.doc(`moderationQueue/${videoId}`);

  return db.runTransaction(async (tx) => {
    const [videoSnap, queueSnap] = await Promise.all([tx.get(videoRef), tx.get(queueRef)]);
    if (!videoSnap.exists) throw new HttpsError("not-found", "Video not found.");
    const video = videoSnap.data() as Video;

    // Tenant is enforced before role, always.
    await requireScope(uid, video.tenantId, video.districtId);

    if (queueSnap.exists) {
      const item = queueSnap.data() as QueueItem;
      const heldByOther =
        item.claimedBy && item.claimedBy !== uid && item.claimedUntil && item.claimedUntil.toMillis() > Date.now();
      if (heldByOther) throw new HttpsError("aborted", "This video is claimed by another moderator.");
    }

    const creatorMembershipRef = db.doc(`memberships/${membershipId(video.creatorId, video.tenantId)}`);
    const membershipSnap = await tx.get(creatorMembershipRef);

    // --- writes ---
    const delta = adjustTrust ? trustDeltaFor(action) : 0;

    if (action === "approve") {
      tx.update(videoRef, { status: "published", publishedAt: FieldValue.serverTimestamp() });
    } else if (action === "reject") {
      tx.update(videoRef, { status: "rejected" });
    } else if (action === "remove") {
      tx.update(videoRef, { status: "removed" });
    } else {
      // escalate: leave pending, flag it, and free the claim for a senior mod.
      tx.update(videoRef, { autoFlags: FieldValue.arrayUnion("ESCALATED") });
    }

    if (queueSnap.exists) {
      if (action === "escalate") {
        tx.update(queueRef, { status: "waiting", claimedBy: null, claimedUntil: null });
      } else {
        tx.update(queueRef, { status: "done", claimedBy: null, claimedUntil: null });
      }
    }

    if (membershipSnap.exists) {
      const current = (membershipSnap.get("trustScore") as number) ?? 0;
      const next = Math.max(TRUST_FLOOR, Math.min(TRUST_CEIL, current + delta));
      const patch: Record<string, unknown> = { trustScore: next };
      if (action === "approve") patch.publishedCount = FieldValue.increment(1);
      if (action === "reject") patch.rejectedCount = FieldValue.increment(1);
      tx.update(creatorMembershipRef, patch);
    }

    tx.set(db.collection("moderationActions").doc(), {
      videoId,
      tenantId: video.tenantId,
      districtId: video.districtId,
      moderatorId: uid,
      action,
      reason,
      note,
      trustDelta: delta,
      at: FieldValue.serverTimestamp(),
    });

    return { ok: true, action };
  });
});
