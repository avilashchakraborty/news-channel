import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole, ROLE_RANK, membershipId } from "../lib/auth";
import { parseInput } from "../lib/validate";

const Input = z.object({
  targetUid: z.string().min(1),
  tenantId: z.string().min(1),
  newRole: z.enum(["viewer", "reporter", "moderator", "admin", "superadmin"]),
  districtScope: z.array(z.string().min(1)).max(50).default([]),
});

/**
 * The single most security-critical function (spec §5). Direct writes to
 * memberships are blocked in rules so this is the only path. Enforces
 * rank(newRole) < rank(caller): an admin can create moderators/reporters, only
 * a superadmin can create admins, and nobody can elevate themselves.
 */
export const setMembershipRole = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { targetUid, tenantId, newRole, districtScope } = parseInput(Input, req.data);

  const caller = await requireRole(uid, tenantId, "admin");

  // Strictly below the caller's rank — this is the whole point of the function.
  if (ROLE_RANK[newRole] >= ROLE_RANK[caller.role]) {
    throw new HttpsError("permission-denied", "You cannot grant a role at or above your own.");
  }
  // Nobody edits their own role here.
  if (targetUid === uid) {
    throw new HttpsError("permission-denied", "You cannot change your own role.");
  }

  const memRef = db.doc(`memberships/${membershipId(targetUid, tenantId)}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(memRef);
    // A caller may not demote/alter someone who already outranks them.
    if (snap.exists && ROLE_RANK[snap.get("role") as keyof typeof ROLE_RANK] >= ROLE_RANK[caller.role]) {
      throw new HttpsError("permission-denied", "Target outranks you.");
    }
    tx.set(
      memRef,
      {
        uid: targetUid,
        tenantId,
        role: newRole,
        districtScope: newRole === "moderator" ? districtScope : [],
        status: "active",
        ...(snap.exists ? {} : { trustScore: newRole === "reporter" ? 50 : 0, publishedCount: 0, rejectedCount: 0, createdAt: FieldValue.serverTimestamp() }),
        addedBy: uid,
      },
      { merge: true },
    );
    tx.set(db.collection("moderationActions").doc(), {
      videoId: "",
      tenantId,
      districtId: "",
      moderatorId: uid,
      action: "escalate",
      reason: `role:${newRole}`,
      note: `Set ${targetUid} → ${newRole}`,
      trustDelta: 0,
      at: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true, targetUid, newRole };
});
