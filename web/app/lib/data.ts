import "server-only";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { FeedVideo } from "./types";

export function slug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

// Server-side Firestore reads with a graceful sample-data fallback, so the site
// renders even before the backend is populated (or without credentials). When
// credentials and data are present, real published videos are served.

let cached: Firestore | null | undefined;

function getDb(): Firestore | null {
  if (cached !== undefined) return cached;
  try {
    if (!getApps().length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (raw) initializeApp({ credential: cert(JSON.parse(raw)) });
      else initializeApp({ credential: applicationDefault() });
    }
    cached = getFirestore();
  } catch {
    cached = null;
  }
  return cached;
}

function docToFeed(id: string, d: FirebaseFirestore.DocumentData): FeedVideo {
  return {
    id,
    headline: d.headline ?? "",
    creatorName: d.creatorName ?? "Reporter",
    creatorHandle: d.creatorHandle ?? "",
    districtId: d.districtId ?? "",
    districtName: d.districtName ?? d.districtId ?? "",
    state: d.state ?? "",
    category: d.category ?? "Civic",
    tags: Array.isArray(d.tags) ? d.tags : [],
    thumbnailUrl: d.thumbnailUrl ?? null,
    playbackUrl: d.playbackUrl ?? null,
    seed: id,
    place: d.place ?? d.districtName ?? d.districtId ?? "",
    date: d.publishedAt?.toDate?.().toLocaleDateString?.("en-IN", { day: "numeric", month: "short", year: "numeric" }) ?? "",
    isLive: !!d.isLive,
  };
}

export async function getVideos(opts: {
  tenantId: string;
  districtId?: string;
  state?: string;
  category?: string;
  limit?: number;
}): Promise<FeedVideo[]> {
  const db = getDb();
  if (!db) return filterSample(opts);
  try {
    let q: FirebaseFirestore.Query = db
      .collection("videos")
      .where("tenantId", "==", opts.tenantId)
      .where("status", "==", "published");
    if (opts.districtId) q = q.where("districtId", "==", opts.districtId);
    q = q.orderBy("rankScore", "desc").limit(opts.limit ?? 24);
    const snap = await q.get();
    let items = snap.docs.map((s) => docToFeed(s.id, s.data()));
    if (opts.state) items = items.filter((v) => slug(v.state) === opts.state);
    if (opts.category) items = items.filter((v) => slug(v.category) === slug(opts.category!));
    return items.length ? items : filterSample(opts);
  } catch {
    return filterSample(opts);
  }
}

export async function getVideo(id: string): Promise<FeedVideo | null> {
  const db = getDb();
  if (db) {
    try {
      const snap = await db.doc(`videos/${id}`).get();
      if (snap.exists && snap.get("status") === "published") return docToFeed(snap.id, snap.data()!);
    } catch {
      /* fall through to sample */
    }
  }
  return SAMPLE.find((v) => v.id === id) ?? null;
}

// ---- Sample fallback ----

function filterSample(opts: { districtId?: string; state?: string; category?: string; limit?: number }): FeedVideo[] {
  let list = SAMPLE;
  if (opts.districtId) list = list.filter((v) => v.districtId === opts.districtId);
  if (opts.state) list = list.filter((v) => slug(v.state) === opts.state);
  if (opts.category) list = list.filter((v) => slug(v.category) === slug(opts.category!));
  return list.slice(0, opts.limit ?? 24);
}

export const SAMPLE: FeedVideo[] = [
  s("d1", "Road caves in near Durgapur Steel Plant, two-hour diversion in place", "Durgapur", "West Bengal", "Civic", "Aug 10, 2026"),
  s("d2", "Traders protest at Benachity market against a new municipal levy", "Durgapur", "West Bengal", "Politics", "Aug 10, 2026"),
  s("d3", "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন চালু হচ্ছে আগামী মাসে", "Durgapur", "West Bengal", "Civic", "Aug 9, 2026"),
  s("d4", "Power cuts leave Muchipara residents stranded through the night", "Durgapur", "West Bengal", "Civic", "Aug 9, 2026"),
  s("d5", "Water level rises at Durgapur Barrage after upstream rain", "Durgapur", "West Bengal", "Breaking", "Aug 8, 2026"),
  s("d6", "Bike rider hurt as truck jumps signal on the NH-19 bypass", "Durgapur", "West Bengal", "Accident", "Aug 8, 2026"),
  s("a1", "Coal-belt cooperative announces record payout to member families", "Asansol", "West Bengal", "Politics", "Aug 9, 2026"),
  s("a2", "Night patrols stepped up after a spate of two-wheeler thefts", "Asansol", "West Bengal", "Police", "Aug 8, 2026"),
  s("a3", "Local club's football final draws a packed ground in Asansol", "Asansol", "West Bengal", "Sports", "Aug 7, 2026"),
  s("k1", "Metro services extended on the Green Line ahead of the festive rush", "Kolkata", "West Bengal", "Civic", "Aug 9, 2026"),
  s("k2", "Waterlogging in north Kolkata after an hour of heavy afternoon rain", "Kolkata", "West Bengal", "Civic", "Aug 9, 2026"),
  s("k3", "Durga Puja pandal budgets swell as sponsors return in force this year", "Kolkata", "West Bengal", "Viral", "Aug 7, 2026"),
  s("k4", "New hygiene ratings for street-food stalls near College Street", "Kolkata", "West Bengal", "Civic", "Aug 8, 2026"),
  s("n1", "On World Tribal Day, a big message to the youth with an assurance of jobs", "National", "India", "Politics", "Aug 9, 2026"),
  s("n2", "Clash between two groups during the Chehalum fair, sticks and stones fly", "National", "India", "Breaking", "Aug 10, 2026"),
  s("n3", "Students protesting a recruitment exam were lathi-charged and tear-gassed", "National", "India", "Breaking", "Aug 10, 2026"),
  s("n4", "A father staying hungry to feed his family: a story that went viral overnight", "National", "India", "Viral", "Aug 10, 2026"),
  s("n5", "Flood-hit villages wait as relief boats reach the last stranded families", "National", "India", "Breaking", "Aug 10, 2026"),
];

function s(id: string, headline: string, district: string, state: string, category: string, date: string): FeedVideo {
  return {
    id,
    headline,
    creatorName: "G+ Reporter",
    creatorHandle: "gplus",
    districtId: slug(district),
    districtName: district,
    state,
    category,
    tags: [category.toLowerCase(), slug(district)],
    thumbnailUrl: null,
    playbackUrl: null,
    seed: id,
    place: district === "National" ? state : `${district}, ${state}`,
    date,
    isLive: false,
  };
}
