import { onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole } from "../lib/auth";
import { parseInput } from "../lib/validate";

const Placements = z.object({
  homeSponsored: z.boolean(),
  frequency: z.number().int().min(3).max(12),
  districtPages: z.boolean(),
  videoDetail: z.boolean(),
  inFeed: z.boolean(),
  banner: z.boolean(),
});

const DEFAULTS = {
  homeSponsored: true,
  frequency: 5,
  districtPages: true,
  videoDetail: true,
  inFeed: false,
  banner: false,
};

/** Admin+ sets where advertiser ads appear across a tenant's surfaces. */
export const updateAdPlacements = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId, placements } = parseInput(
    z.object({ tenantId: z.string().min(1), placements: Placements }),
    req.data,
  );
  await requireRole(uid, tenantId, "admin");
  await db.doc(`adSettings/${tenantId}`).set(
    { tenantId, ...placements, updatedBy: uid, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  return { ok: true };
});

/** Public read of a tenant's ad placements (the portal reads this). */
export const getAdPlacements = onCall(callableBase, async (req) => {
  const { tenantId } = parseInput(z.object({ tenantId: z.string().min(1) }), req.data);
  const snap = await db.doc(`adSettings/${tenantId}`).get();
  return { placements: snap.exists ? { ...DEFAULTS, ...snap.data() } : DEFAULTS };
});
