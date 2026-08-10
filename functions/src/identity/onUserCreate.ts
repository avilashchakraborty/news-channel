import { beforeUserCreated, HttpsError } from "firebase-functions/v2/identity";
import { REGION, DEFAULT_TENANT_ID } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { membershipId } from "../lib/auth";

// Auth blocking trigger. Rejects non-Google providers and seeds the identity:
// users/{uid} (handle null until claimHandle) plus a viewer membership in the
// default tenant (spec §5). Runs before the Auth user exists.
export const onUserCreate = beforeUserCreated({ region: REGION }, async (event) => {
  const user = event.data;
  if (!user) throw new HttpsError("invalid-argument", "Missing user record.");

  const providers = new Set<string>();
  if (event.credential?.providerId) providers.add(event.credential.providerId);
  for (const p of user.providerData ?? []) providers.add(p.providerId);
  const isGoogle = providers.has("google.com") || providers.size === 0; // size 0 = emulator/import edge

  if (!isGoogle) {
    throw new HttpsError("permission-denied", "Sign in with Google to continue.");
  }

  const uid = user.uid;
  const displayName = user.displayName ?? (user.email ? user.email.split("@")[0] : "Reader");
  const avatarInitial = (displayName.trim()[0] ?? "R").toUpperCase();

  const batch = db.batch();
  batch.set(db.doc(`users/${uid}`), {
    email: user.email ?? null,
    displayName,
    handle: null,
    avatarInitial,
    photoURL: user.photoURL ?? null,
    defaultTenantId: DEFAULT_TENANT_ID,
    homeDistrictId: null,
    languages: [],
    createdAt: FieldValue.serverTimestamp(),
    lastActiveAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.doc(`memberships/${membershipId(uid, DEFAULT_TENANT_ID)}`), {
    uid,
    tenantId: DEFAULT_TENANT_ID,
    role: "viewer",
    districtScope: [],
    trustScore: 0,
    status: "active",
    publishedCount: 0,
    rejectedCount: 0,
    addedBy: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return {};
});
