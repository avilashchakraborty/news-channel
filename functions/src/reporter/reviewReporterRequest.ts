import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireScope, membershipId } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { sendToUser } from "../lib/notify";
import { VerificationRequest } from "../types";

const Input = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["approve", "decline", "more_info"]),
  note: z.string().trim().max(1000).nullable().default(null),
});

/**
 * Moderator decision on a reporter application (spec §5). Approve promotes the
 * membership to reporter with trustScore 50 in one transaction; decline /
 * more_info just updates status + note. Either way writes a moderationActions
 * entry and notifies the applicant.
 */
export const reviewReporterRequest = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { requestId, decision, note } = parseInput(Input, req.data);

  const reqRef = db.doc(`verificationRequests/${requestId}`);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists) throw new HttpsError("not-found", "Request not found.");
    const vr = snap.data() as VerificationRequest;

    await requireScope(uid, vr.tenantId, vr.districtId);

    if (vr.status !== "waiting" && vr.status !== "more_info") {
      throw new HttpsError("failed-precondition", "This request is already resolved.");
    }

    const newStatus = decision === "approve" ? "approved" : decision === "decline" ? "declined" : "more_info";
    tx.update(reqRef, { status: newStatus, reviewedBy: uid, reviewNote: note });

    if (decision === "approve") {
      const memRef = db.doc(`memberships/${membershipId(vr.uid, vr.tenantId)}`);
      tx.set(
        memRef,
        {
          uid: vr.uid,
          tenantId: vr.tenantId,
          role: "reporter",
          trustScore: 50,
          status: "active",
          districtScope: [],
          publishedCount: 0,
          rejectedCount: 0,
          addedBy: uid,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    tx.set(db.collection("moderationActions").doc(), {
      videoId: vr.sampleVideoId ?? "",
      tenantId: vr.tenantId,
      districtId: vr.districtId,
      moderatorId: uid,
      action: decision === "approve" ? "approve" : "reject",
      reason: decision === "more_info" ? "more_info" : null,
      note,
      trustDelta: 0,
      at: FieldValue.serverTimestamp(),
    });

    return { uid: vr.uid, newStatus };
  });

  const message =
    result.newStatus === "approved"
      ? "You're approved to report. Open the app to post your first video."
      : result.newStatus === "declined"
        ? "Your reporter application was not approved."
        : "We need a bit more information on your reporter application.";
  await sendToUser(result.uid, "Reporter application update", message, { kind: "reporter_review" });

  return { ok: true, status: result.newStatus };
});
