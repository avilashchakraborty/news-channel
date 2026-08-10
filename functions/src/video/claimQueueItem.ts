import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, Timestamp } from "../lib/firestore";
import { requireAuth, requireScope } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { QueueItem } from "../types";

const CLAIM_MS = 5 * 60_000; // soft lock, auto-released by releaseStaleClaims

const Input = z.object({ videoId: z.string().min(1) });

/**
 * Soft-claim a queue item so two moderators don't review the same video
 * (spec §5). Sets claimedBy + claimedUntil = now + 5min. A claim held by another
 * moderator that hasn't expired blocks the claim.
 */
export const claimQueueItem = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { videoId } = parseInput(Input, req.data);
  const ref = db.doc(`moderationQueue/${videoId}`);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Queue item not found.");
    const item = snap.data() as QueueItem;

    await requireScope(uid, item.tenantId, item.districtId);

    if (item.status === "done") throw new HttpsError("failed-precondition", "Already reviewed.");

    const heldByOther =
      item.claimedBy && item.claimedBy !== uid && item.claimedUntil && item.claimedUntil.toMillis() > Date.now();
    if (heldByOther) throw new HttpsError("aborted", "Another moderator is reviewing this video.");

    const until = Timestamp.fromMillis(Date.now() + CLAIM_MS);
    tx.update(ref, { claimedBy: uid, claimedUntil: until, status: "in_review" });
    return { claimedUntil: until.toMillis() };
  });
});
