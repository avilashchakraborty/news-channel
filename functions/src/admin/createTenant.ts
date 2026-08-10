import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, membershipId } from "../lib/auth";
import { parseInput } from "../lib/validate";

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]{2,40}$/;

const DistrictInput = z.object({
  slug: z.string().regex(SLUG, "District slug must be lowercase alphanumeric/hyphen."),
  name: z.string().trim().min(1).max(80),
  stateId: z.string().min(1).max(40),
  nameLocal: z.record(z.string()).default({}),
});

const Input = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().regex(SLUG, "Slug must be lowercase alphanumeric/hyphen."),
  brandColor: z.string().regex(HEX, "Brand colour must be a #RRGGBB hex."),
  tagline: z.string().trim().max(140).default(""),
  logoSvg: z.string().max(20000).default(""),
  districts: z.array(DistrictInput).min(1).max(200),
});

/**
 * Create a tenant with its districts and seed an admin membership for the
 * caller (spec §5). Superadmin only. Tenant slug must be unique.
 */
export const createTenant = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const input = parseInput(Input, req.data);

  // The caller must be a superadmin somewhere in the platform.
  const anyMembership = await db
    .collection("memberships")
    .where("uid", "==", uid)
    .where("role", "==", "superadmin")
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (anyMembership.empty) throw new HttpsError("permission-denied", "Superadmin only.");

  await db.runTransaction(async (tx) => {
    const tenantRef = db.doc(`tenants/${input.slug}`);
    const existing = await tx.get(tenantRef);
    if (existing.exists) throw new HttpsError("already-exists", "A tenant with that slug exists.");

    tx.set(tenantRef, {
      name: input.name,
      slug: input.slug,
      brandColor: input.brandColor,
      logoSvg: input.logoSvg,
      tagline: input.tagline,
      districts: input.districts.map((d) => d.slug),
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    for (const d of input.districts) {
      tx.set(db.doc(`districts/${d.slug}`), {
        tenantId: input.slug,
        name: d.name,
        nameLocal: d.nameLocal,
        stateId: d.stateId,
        geohashPrefix: "",
        videoCount: 0,
        status: "active",
      });
    }

    tx.set(db.doc(`memberships/${membershipId(uid, input.slug)}`), {
      uid,
      tenantId: input.slug,
      role: "admin",
      districtScope: [],
      trustScore: 0,
      status: "active",
      publishedCount: 0,
      rejectedCount: 0,
      addedBy: uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { ok: true, tenantId: input.slug };
});
