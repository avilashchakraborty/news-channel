import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase, VERCEL_REVALIDATE_URL, VERCEL_REVALIDATE_SECRET } from "../config";
import { db } from "../lib/firestore";
import { requireAuth, requireRole } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { revalidateVercel } from "../lib/revalidate";

const HEX = /^#[0-9a-fA-F]{6}$/;

const Input = z.object({
  tenantId: z.string().min(1),
  patch: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      brandColor: z.string().regex(HEX, "Brand colour must be a #RRGGBB hex.").optional(),
      logoSvg: z.string().max(20000).optional(),
      tagline: z.string().trim().max(140).optional(),
    })
    .refine((p) => Object.keys(p).length > 0, "Nothing to update."),
});

/**
 * Update a tenant's branding (spec §5). Admin+. Validates the hex colour, writes
 * only the allowed fields, then triggers a Vercel revalidate so the tenant's
 * public pages pick up the new brand.
 */
export const updateTenantBranding = onCall(
  { ...callableBase, secrets: [VERCEL_REVALIDATE_SECRET] },
  async (req) => {
    const uid = requireAuth(req);
    const { tenantId, patch } = parseInput(Input, req.data);

    await requireRole(uid, tenantId, "admin");

    const tenantRef = db.doc(`tenants/${tenantId}`);
    const snap = await tenantRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Tenant not found.");

    await tenantRef.update(patch);

    const slug = (snap.get("slug") as string) ?? tenantId;
    await revalidateVercel(VERCEL_REVALIDATE_URL.value(), VERCEL_REVALIDATE_SECRET.value(), [`/${slug}`]);

    return { ok: true };
  },
);
