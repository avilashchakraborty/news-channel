import { getMessaging } from "firebase-admin/messaging";
import { db } from "./firestore";

// FCM push helpers. Device tokens live at users/{uid}/fcmTokens/{token}
// (existence = registered), written client-side under the users/{userId}/**
// rule. Fan-out to followers is batched at 500 per multicast (spec §5).

export async function getUserTokens(uid: string): Promise<string[]> {
  const snap = await db.collection(`users/${uid}/fcmTokens`).get();
  return snap.docs.map((d) => d.id);
}

export async function sendToUser(
  uid: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const tokens = await getUserTokens(uid);
  await sendMulticast(tokens, title, body, data);
}

/**
 * Fan a notification out to a creator's followers. Follower edges are
 * users/{uid}/following/{creatorId} carrying a `creatorId` field, queried via a
 * collection-group index (spec §2/§3).
 */
export async function notifyFollowers(
  creatorId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const edges = await db.collectionGroup("following").where("creatorId", "==", creatorId).get();
  const followerUids = edges.docs.map((d) => d.ref.parent.parent?.id).filter((x): x is string => !!x);

  const tokens: string[] = [];
  for (const uid of followerUids) tokens.push(...(await getUserTokens(uid)));
  await sendMulticast(tokens, title, body, data);
}

async function sendMulticast(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (tokens.length === 0) return;
  const messaging = getMessaging();
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    try {
      await messaging.sendEachForMulticast({ tokens: batch, notification: { title, body }, data });
    } catch (e) {
      console.error("FCM multicast failed", e);
    }
  }
}
