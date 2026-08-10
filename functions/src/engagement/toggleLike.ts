import { onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db } from "../lib/firestore";
import { requireAuth } from "../lib/auth";
import { enforceRateLimit, HOUR } from "../lib/rateLimit";
import { parseInput } from "../lib/validate";
import { incrementShard } from "../lib/shards";

const Input = z.object({ videoId: z.string().min(1) });

/**
 * Like / unlike. The like edge (videos/{videoId}/likes/{uid}) is the source of
 * truth for existence; the count goes to a random likeShard, not the document
 * (spec §5/§7). Returns the caller's new like state.
 */
export const toggleLike = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { videoId } = parseInput(Input, req.data);

  await enforceRateLimit(uid, "toggleLike", 200, HOUR);

  const likeRef = db.doc(`videos/${videoId}/likes/${uid}`);
  const liked = await db.runTransaction(async (tx) => {
    const snap = await tx.get(likeRef);
    if (snap.exists) {
      tx.delete(likeRef);
      return false;
    }
    tx.set(likeRef, { at: Date.now() });
    return true;
  });

  await incrementShard(videoId, "likeShards", liked ? 1 : -1);
  return { liked };
});
