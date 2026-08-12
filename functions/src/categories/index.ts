import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole } from "../lib/auth";
import { parseInput } from "../lib/validate";
import { Category } from "../types";

const SLUG = /[^a-z0-9]+/g;
const HEX = /^#[0-9a-fA-F]{6}$/;

function catId(tenantId: string, slug: string): string {
  return `${tenantId}__${slug}`;
}

/** Admin+ creates a browsable/filable category for a tenant (spec extension). */
export const createCategory = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId, label, emoji, color } = parseInput(
    z.object({
      tenantId: z.string().min(1),
      label: z.string().trim().min(2).max(40),
      emoji: z.string().min(1).max(4).default("🗂️"),
      color: z.string().regex(HEX, "Colour must be #RRGGBB.").default("#E01B22"),
    }),
    req.data,
  );
  await requireRole(uid, tenantId, "admin");

  const slug = label.toLowerCase().replace(SLUG, "-").replace(/^-|-$/g, "");
  if (!slug) throw new HttpsError("invalid-argument", "Invalid category name.");

  const ref = db.doc(`categories/${catId(tenantId, slug)}`);
  if ((await ref.get()).exists) throw new HttpsError("already-exists", "That category exists.");

  await ref.set({
    tenantId,
    slug,
    label,
    emoji,
    color,
    createdBy: uid,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, slug };
});

/** Admin+ archives a category (kept for historical videos, hidden from pickers). */
export const deleteCategory = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId, slug } = parseInput(z.object({ tenantId: z.string().min(1), slug: z.string().min(1) }), req.data);
  await requireRole(uid, tenantId, "admin");
  await db.doc(`categories/${catId(tenantId, slug)}`).set({ status: "archived" }, { merge: true });
  return { ok: true };
});

/** Public list of a tenant's active categories. */
export const getCategories = onCall(callableBase, async (req) => {
  const { tenantId } = parseInput(z.object({ tenantId: z.string().min(1) }), req.data);
  const snap = await db.collection("categories").where("tenantId", "==", tenantId).where("status", "==", "active").get();
  const categories = snap.docs.map((d) => {
    const c = d.data() as Category;
    return { slug: c.slug, label: c.label, emoji: c.emoji, color: c.color };
  });
  return { categories };
});
