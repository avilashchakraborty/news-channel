import { HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { db } from "./firestore";
import { Membership, Role } from "../types";

export const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  reporter: 2,
  moderator: 3,
  admin: 4,
  superadmin: 5,
};

export function membershipId(uid: string, tenantId: string): string {
  return `${uid}_${tenantId}`;
}

/** The signed-in uid, or throw unauthenticated. */
export function requireAuth(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  return uid;
}

export async function getMembership(uid: string, tenantId: string): Promise<Membership | null> {
  const snap = await db.doc(`memberships/${membershipId(uid, tenantId)}`).get();
  return snap.exists ? (snap.data() as Membership) : null;
}

export async function requireMembership(uid: string, tenantId: string): Promise<Membership> {
  const m = await getMembership(uid, tenantId);
  if (!m || m.status !== "active") {
    throw new HttpsError("permission-denied", "No active membership for this tenant.");
  }
  return m;
}

/**
 * Tenant is checked before role, always (spec §4). A moderator at tenant A must
 * never pass a check for tenant B whatever their role says.
 */
export async function requireRole(uid: string, tenantId: string, role: Role): Promise<Membership> {
  const m = await requireMembership(uid, tenantId);
  if (ROLE_RANK[m.role] < ROLE_RANK[role]) {
    throw new HttpsError("permission-denied", `Requires ${role} or higher in this tenant.`);
  }
  return m;
}

export function isAtLeast(m: Membership, role: Role): boolean {
  return m.status === "active" && ROLE_RANK[m.role] >= ROLE_RANK[role];
}

/** Admin+ sees the whole tenant; a moderator only their district scope. */
export function inScope(m: Membership, districtId: string): boolean {
  if (ROLE_RANK[m.role] >= ROLE_RANK.admin) return true;
  if (ROLE_RANK[m.role] < ROLE_RANK.moderator) return false;
  return m.districtScope.length === 0 || m.districtScope.includes(districtId);
}

export async function requireScope(uid: string, tenantId: string, districtId: string): Promise<Membership> {
  const m = await requireRole(uid, tenantId, "moderator");
  if (!inScope(m, districtId)) {
    throw new HttpsError("permission-denied", "District is outside your moderation scope.");
  }
  return m;
}
