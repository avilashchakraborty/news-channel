import { db, FieldValue } from "./firestore";

// Firestore caps a single document at ~1 sustained write/second, so hot
// counters (views, likes, comments) fan out across shards and are summed
// back into the parent document by aggregateCounters every 5 min (spec §7).
export const SHARD_COUNT = 10;

export type ShardKind = "viewShards" | "likeShards" | "commentShards";

function randomShardId(): string {
  return Math.floor(Math.random() * SHARD_COUNT).toString();
}

export function incrementShard(videoId: string, kind: ShardKind, by = 1): Promise<FirebaseFirestore.WriteResult> {
  return db
    .doc(`videos/${videoId}/${kind}/${randomShardId()}`)
    .set({ count: FieldValue.increment(by) }, { merge: true });
}

export async function sumShards(videoId: string, kind: ShardKind): Promise<number> {
  const snap = await db.collection(`videos/${videoId}/${kind}`).get();
  let total = 0;
  snap.forEach((d) => {
    total += (d.data().count as number) ?? 0;
  });
  return total;
}
