import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole } from "../lib/auth";
import { enforceRateLimit, HOUR } from "../lib/rateLimit";
import { parseInput } from "../lib/validate";
import { Advertiser, Campaign, Ad } from "../types";

const SHARDS = 10;
function advId(uid: string, tenantId: string) {
  return `${uid}_${tenantId}`;
}

async function requireAdvertiser(uid: string, tenantId: string): Promise<Advertiser> {
  const snap = await db.doc(`advertisers/${advId(uid, tenantId)}`).get();
  if (!snap.exists || snap.get("status") !== "active") {
    throw new HttpsError("permission-denied", "No active advertiser account for this tenant.");
  }
  return snap.data() as Advertiser;
}

// ---- Account ----

/** Self-serve advertiser signup (any signed-in user). */
export const createAdvertiserAccount = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId, orgName } = parseInput(
    z.object({ tenantId: z.string().min(1), orgName: z.string().trim().min(2).max(80) }),
    req.data,
  );
  const ref = db.doc(`advertisers/${advId(uid, tenantId)}`);
  await ref.set(
    {
      uid,
      tenantId,
      orgName,
      walletBalance: 0,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { ok: true };
});

/** Wallet top-up. Mock — wire a payment gateway before production. */
export const addFunds = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId, amount } = parseInput(
    z.object({ tenantId: z.string().min(1), amount: z.number().int().min(100).max(1_000_000) }),
    req.data,
  );
  await requireAdvertiser(uid, tenantId);
  await db.doc(`advertisers/${advId(uid, tenantId)}`).update({ walletBalance: FieldValue.increment(amount) });
  return { ok: true };
});

// ---- Campaigns ----

export const createCampaign = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const c = parseInput(
    z.object({
      tenantId: z.string().min(1),
      name: z.string().trim().min(3).max(80),
      objective: z.enum(["Awareness", "Traffic", "Leads", "App installs"]),
      dailyBudget: z.number().int().min(100).max(1_000_000),
      districts: z.array(z.string()).max(50).default([]),
      categories: z.array(z.string()).max(50).default([]),
      start: z.string().min(4).max(10),
      end: z.string().min(4).max(10),
    }),
    req.data,
  );
  await requireAdvertiser(uid, c.tenantId);
  await enforceRateLimit(uid, "createCampaign", 30, HOUR);

  const ref = db.collection("campaigns").doc();
  await ref.set({
    advertiserId: uid,
    tenantId: c.tenantId,
    name: c.name,
    objective: c.objective,
    dailyBudget: c.dailyBudget,
    districts: c.districts,
    categories: c.categories,
    start: c.start,
    end: c.end,
    status: "active",
    spend: 0,
    impressions: 0,
    clicks: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, campaignId: ref.id };
});

export const updateCampaignStatus = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { campaignId, status } = parseInput(
    z.object({ campaignId: z.string().min(1), status: z.enum(["active", "paused", "ended"]) }),
    req.data,
  );
  const ref = db.doc(`campaigns/${campaignId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Campaign not found.");
  if (snap.get("advertiserId") !== uid) throw new HttpsError("permission-denied", "Not your campaign.");
  await ref.update({ status });
  return { ok: true };
});

// ---- Ads ----

export const createAd = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const a = parseInput(
    z.object({
      campaignId: z.string().min(1),
      headline: z.string().trim().min(5).max(120),
      imageUrl: z.string().max(500).default(""),
      cta: z.string().trim().min(2).max(30),
      url: z.string().url(),
      format: z.enum(["In-feed video", "Banner", "Sponsored card"]),
    }),
    req.data,
  );
  const campaignSnap = await db.doc(`campaigns/${a.campaignId}`).get();
  if (!campaignSnap.exists) throw new HttpsError("not-found", "Campaign not found.");
  const campaign = campaignSnap.data() as Campaign;
  if (campaign.advertiserId !== uid) throw new HttpsError("permission-denied", "Not your campaign.");
  await requireAdvertiser(uid, campaign.tenantId);

  const ref = db.collection("ads").doc();
  await ref.set({
    campaignId: a.campaignId,
    advertiserId: uid,
    tenantId: campaign.tenantId,
    headline: a.headline,
    imageUrl: a.imageUrl,
    cta: a.cta,
    url: a.url,
    format: a.format,
    status: "active",
    review: "pending", // ads are reviewed before serving
    impressions: 0,
    clicks: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, adId: ref.id };
});

export const updateAdStatus = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { adId, status } = parseInput(
    z.object({ adId: z.string().min(1), status: z.enum(["active", "paused"]) }),
    req.data,
  );
  const ref = db.doc(`ads/${adId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Ad not found.");
  if (snap.get("advertiserId") !== uid) throw new HttpsError("permission-denied", "Not your ad.");
  await ref.update({ status });
  return { ok: true };
});

/** Admin/moderator ad review (spec-style moderation for paid creative). */
export const reviewAd = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { adId, decision } = parseInput(
    z.object({ adId: z.string().min(1), decision: z.enum(["approved", "rejected"]) }),
    req.data,
  );
  const ref = db.doc(`ads/${adId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Ad not found.");
  await requireRole(uid, snap.get("tenantId") as string, "moderator");
  await ref.update({ review: decision });
  return { ok: true };
});

// ---- Dashboard ----

export const getAdvertiserDashboard = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const { tenantId } = parseInput(z.object({ tenantId: z.string().min(1) }), req.data);
  const advertiser = await requireAdvertiser(uid, tenantId);

  const [campaignsSnap, adsSnap] = await Promise.all([
    db.collection("campaigns").where("advertiserId", "==", uid).where("tenantId", "==", tenantId).get(),
    db.collection("ads").where("advertiserId", "==", uid).where("tenantId", "==", tenantId).get(),
  ]);

  const campaigns = campaignsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Campaign) }));
  const ads = adsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Ad) }));
  const totals = campaigns.reduce(
    (t, c) => ({ spend: t.spend + c.spend, impressions: t.impressions + c.impressions, clicks: t.clicks + c.clicks }),
    { spend: 0, impressions: 0, clicks: 0 },
  );
  return { wallet: advertiser.walletBalance, campaigns, ads, totals };
});

// ---- Serving + events ----

/** Ads to inject into the feed: active, approved, matching district/category. */
export const getAds = onCall(callableBase, async (req) => {
  const { tenantId, districtId, category, limit } = parseInput(
    z.object({
      tenantId: z.string().min(1),
      districtId: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(10).default(3),
    }),
    req.data,
  );

  const campaignsSnap = await db
    .collection("campaigns")
    .where("tenantId", "==", tenantId)
    .where("status", "==", "active")
    .get();

  const matching = campaignsSnap.docs.filter((d) => {
    const c = d.data() as Campaign;
    const districtOk = c.districts.length === 0 || (districtId ? c.districts.includes(districtId) : true);
    const categoryOk = c.categories.length === 0 || (category ? c.categories.includes(category) : true);
    return districtOk && categoryOk;
  });
  const campaignIds = matching.map((d) => d.id);
  if (campaignIds.length === 0) return { ads: [] };

  const chunks: string[][] = [];
  for (let i = 0; i < campaignIds.length; i += 10) chunks.push(campaignIds.slice(i, i + 10));
  const adDocs = (
    await Promise.all(
      chunks.map((ids) =>
        db
          .collection("ads")
          .where("campaignId", "in", ids)
          .where("status", "==", "active")
          .where("review", "==", "approved")
          .get(),
      ),
    )
  ).flatMap((s) => s.docs);

  const ads = adDocs.slice(0, limit).map((d) => {
    const a = d.data() as Ad;
    return { id: d.id, headline: a.headline, imageUrl: a.imageUrl, cta: a.cta, url: a.url, format: a.format };
  });
  return { ads };
});

/** Record an impression or click (App Check enforced, sharded). */
export const recordAdEvent = onCall(callableBase, async (req) => {
  const { adId, type } = parseInput(
    z.object({ adId: z.string().min(1), type: z.enum(["impression", "click"]) }),
    req.data,
  );
  const kind = type === "impression" ? "impShards" : "clickShards";
  const shard = Math.floor(Math.random() * SHARDS).toString();
  await db.doc(`ads/${adId}/${kind}/${shard}`).set({ count: FieldValue.increment(1) }, { merge: true });
  return { ok: true };
});
