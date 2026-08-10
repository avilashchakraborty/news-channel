import { onCall } from "firebase-functions/v2/https";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { commitInChunks } from "../lib/batch";

/**
 * Soft delete (spec §5): anonymize the user, release the username lock, suspend
 * every membership, and mark the user's videos `removed`. Media is hard-deleted
 * 30 days later by purgeDeletedAccounts — never inline, or the moderation audit
 * trail is lost.
 */
export const deleteAccount = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return { ok: true };

  const handle = userSnap.get("handle") as string | null;

  const [memberships, videos] = await Promise.all([
    db.collection("memberships").where("uid", "==", uid).get(),
    db.collection("videos").where("creatorId", "==", uid).get(),
  ]);

  const ops: Array<(b: FirebaseFirestore.WriteBatch) => void> = [];

  ops.push((b) =>
    b.update(userRef, {
      displayName: "[deleted]",
      handle: null,
      email: null,
      photoURL: null,
      avatarInitial: "•",
      status: "deleted",
      deletedAt: FieldValue.serverTimestamp(),
    }),
  );

  if (handle) ops.push((b) => b.delete(db.doc(`usernames/${handle}`)));

  for (const m of memberships.docs) {
    ops.push((b) => b.update(m.ref, { status: "suspended" }));
  }
  for (const v of videos.docs) {
    const status = v.get("status");
    if (status !== "removed") ops.push((b) => b.update(v.ref, { status: "removed" }));
  }

  await commitInChunks(ops);
  return { ok: true };
});
