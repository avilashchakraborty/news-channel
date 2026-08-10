import { HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue, Timestamp } from "./firestore";

export const HOUR = 3_600_000;
export const DAY = 86_400_000;

/**
 * Fixed-window rate limiter backed by rateLimits/{uid}_{action}_{windowStart}
 * (spec §8). Runs in a transaction so concurrent calls can't both slip past
 * the ceiling. Throws resource-exhausted when the window is full.
 */
export async function enforceRateLimit(
  uid: string,
  action: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const ref = db.doc(`rateLimits/${uid}_${action}_${windowStart}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? ((snap.data()!.count as number) ?? 0) : 0;
    if (count >= limit) {
      throw new HttpsError(
        "resource-exhausted",
        `Rate limit reached for ${action}. Try again later.`,
      );
    }
    tx.set(
      ref,
      {
        uid,
        action,
        count: count + 1,
        windowStart: Timestamp.fromMillis(windowStart),
        // Kept for ~2 windows so the purge query / TTL policy can reap it.
        expiresAt: Timestamp.fromMillis(windowStart + windowMs * 2),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}
