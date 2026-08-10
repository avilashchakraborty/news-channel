import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase, PHONE_ENCRYPTION_KEY } from "../config";
import { db, FieldValue, Timestamp } from "../lib/firestore";
import { requireAuth, requireMembership } from "../lib/auth";
import { parseInput, normalizeIndianPhone, namesRoughlyMatch } from "../lib/validate";
import { encryptPhone, phoneHash } from "../lib/crypto";
import { District } from "../types";

const REAPPLY_MS = 7 * 86_400_000; // 7 days after a decline (spec §5/§8)

const Input = z.object({
  districtId: z.string().min(1).max(64),
  phone: z.string().min(6).max(20),
  idProofPublicId: z.string().min(1), // Cloudinary authenticated asset id
  idProofType: z.string().min(2).max(40),
  idName: z.string().trim().max(120).optional(), // name as printed on the ID, if captured
  sampleVideoId: z.string().nullable().default(null),
});

/**
 * Apply to become a reporter (spec §5). Requires an active viewer membership.
 * Encrypts the phone (AES-256), stores phoneLast4 + a phone hash for the
 * duplicate check, runs auto-checks, and writes a waiting verificationRequest.
 * One open request per user; a declined user may reapply after 7 days.
 */
export const requestReporterRole = onCall(
  { ...callableBase, secrets: [PHONE_ENCRYPTION_KEY] },
  async (req) => {
    const uid = requireAuth(req);
    const input = parseInput(Input, req.data);

    const districtSnap = await db.doc(`districts/${input.districtId}`).get();
    if (!districtSnap.exists) throw new HttpsError("invalid-argument", "Unknown district.");
    const district = districtSnap.data() as District;

    // Must already be a member of this tenant (any active role; viewers apply).
    await requireMembership(uid, district.tenantId);

    // One open request; respect the 7-day reapply window after a decline.
    const mine = await db
      .collection("verificationRequests")
      .where("uid", "==", uid)
      .where("tenantId", "==", district.tenantId)
      .get();
    for (const d of mine.docs) {
      const status = d.get("status");
      if (status === "waiting" || status === "more_info") {
        throw new HttpsError("failed-precondition", "You already have a pending application.");
      }
      if (status === "declined") {
        const at = (d.get("createdAt") as Timestamp | undefined)?.toMillis() ?? 0;
        if (Date.now() - at < REAPPLY_MS) {
          throw new HttpsError("failed-precondition", "You can reapply 7 days after a decline.");
        }
      }
    }

    const phone = normalizeIndianPhone(input.phone);
    const hash = phoneHash(phone);

    // No other account may hold this phone.
    const dupPhone = await db.collection("verificationRequests").where("phoneHash", "==", hash).get();
    const noDuplicate = dupPhone.docs.every((d) => d.get("uid") === uid);

    const userSnap = await db.doc(`users/${uid}`).get();
    const profileName = (userSnap.get("displayName") as string) ?? "";
    const nameMatch = input.idName ? namesRoughlyMatch(input.idName, profileName) : true;

    const ref = db.collection("verificationRequests").doc();
    await ref.set({
      uid,
      tenantId: district.tenantId,
      districtId: input.districtId,
      phoneEncrypted: encryptPhone(phone, PHONE_ENCRYPTION_KEY.value()),
      phoneLast4: phone.slice(-4),
      phoneHash: hash,
      idProofUrl: input.idProofPublicId, // signed on read by moderators only
      idProofType: input.idProofType,
      sampleVideoId: input.sampleVideoId,
      autoChecks: { phoneVerified: true, noDuplicate, nameMatch },
      status: "waiting",
      reviewedBy: null,
      reviewNote: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { requestId: ref.id, autoChecks: { phoneVerified: true, noDuplicate, nameMatch } };
  },
);
