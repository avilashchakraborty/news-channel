import { db } from "./firestore";

// Firestore batches cap at 500 writes. commitInChunks runs a list of write
// operations in 500-op batches so callers don't have to think about the limit.
export async function commitInChunks(
  ops: Array<(b: FirebaseFirestore.WriteBatch) => void>,
  chunkSize = 450,
): Promise<void> {
  for (let i = 0; i < ops.length; i += chunkSize) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + chunkSize)) op(batch);
    await batch.commit();
  }
}
