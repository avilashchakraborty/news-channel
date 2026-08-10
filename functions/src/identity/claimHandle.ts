import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { enforceRateLimit, DAY } from "../lib/rateLimit";
import { parseInput, normalizeHandle, assertHandleAllowed } from "../lib/validate";

const Input = z.object({
  handle: z.string().min(1).max(40),
  displayName: z.string().trim().min(2).max(40),
  homeDistrictId: z.string().min(1).max(64),
});

/**
 * Claim a platform-unique handle. The uniqueness lock is the existence of
 * usernames/{handle}; the create + user update happen in one transaction so two
 * people typing the same handle can't both succeed (spec §5). Never check-then-
 * write outside a transaction.
 */
export const claimHandle = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { handle: rawHandle, displayName, homeDistrictId } = parseInput(Input, req.data);

  await enforceRateLimit(uid, "claimHandle", 5, DAY);

  const handle = normalizeHandle(rawHandle);
  assertHandleAllowed(handle);

  const district = await db.doc(`districts/${homeDistrictId}`).get();
  if (!district.exists) throw new HttpsError("invalid-argument", "Unknown district.");

  await db.runTransaction(async (tx) => {
    const handleRef = db.doc(`usernames/${handle}`);
    const userRef = db.doc(`users/${uid}`);

    const [handleSnap, userSnap] = await Promise.all([tx.get(handleRef), tx.get(userRef)]);
    if (!userSnap.exists) throw new HttpsError("failed-precondition", "User record not found.");

    const existing = userSnap.get("handle") as string | null;
    if (handleSnap.exists) {
      // Idempotent if the caller already owns it; otherwise taken.
      if (existing === handle && handleSnap.get("uid") === uid) return;
      throw new HttpsError("already-exists", "That handle is taken.");
    }

    // Releasing a previously held handle keeps the lock table consistent.
    if (existing && existing !== handle) tx.delete(db.doc(`usernames/${existing}`));

    tx.set(handleRef, { uid, createdAt: FieldValue.serverTimestamp() });
    tx.update(userRef, {
      handle,
      displayName,
      avatarInitial: displayName.trim()[0]?.toUpperCase() ?? "R",
      homeDistrictId,
      lastActiveAt: FieldValue.serverTimestamp(),
    });
  });

  return { handle };
});
