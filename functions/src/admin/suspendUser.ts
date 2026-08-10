import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole, ROLE_RANK, getMembership, membershipId } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { commitInChunks } from "../lib/batch";

const Input = z.object({
  targetUid: z.string().min(1),
  tenantId: z.string().min(1),
  reason: z.string().trim().max(500).default(""),
});

/**
 * Suspend a member and hide their published videos (spec §5). Admins may
 * suspend anyone below them; moderators may suspend reporters only.
 */
export const suspendUser = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { targetUid, tenantId, reason } = parseInput(Input, req.data);

  const caller = await requireRole(uid, tenantId, "moderator");
  const target = await getMembership(targetUid, tenantId);
  if (!target) throw new HttpsError("not-found", "No membership for that user in this tenant.");

  const isAdmin = ROLE_RANK[caller.role] >= ROLE_RANK.admin;
  if (!isAdmin && target.role !== "reporter") {
    throw new HttpsError("permission-denied", "Moderators may suspend reporters only.");
  }
  if (ROLE_RANK[target.role] >= ROLE_RANK[caller.role]) {
    throw new HttpsError("permission-denied", "You cannot suspend someone at or above your rank.");
  }

  const videos = await db
    .collection("videos")
    .where("creatorId", "==", targetUid)
    .where("tenantId", "==", tenantId)
    .where("status", "==", "published")
    .get();

  const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];
  ops.push((b) => b.update(db.doc(`memberships/${membershipId(targetUid, tenantId)}`), { status: "suspended" }));
  for (const v of videos.docs) ops.push((b) => b.update(v.ref, { status: "removed" }));
  ops.push((b) =>
    b.set(db.collection("moderationActions").doc(), {
      videoId: "",
      tenantId,
      districtId: "",
      moderatorId: uid,
      action: "remove",
      reason: reason || "suspended",
      note: `Suspended ${targetUid}`,
      trustDelta: 0,
      at: FieldValue.serverTimestamp(),
    }),
  );

  await commitInChunks(ops);
  return { ok: true, hiddenVideos: videos.size };
});
