import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import {
  callableBase,
  BUNNY_STREAM_API_KEY,
  BUNNY_STREAM_LIBRARY_ID,
  BUNNY_STREAM_CDN_HOSTNAME,
} from "../config";
import { db, FieldValue } from "../lib/firestore";
import { requireAuth, requireRole } from "../lib/auth";
import { enforceRateLimit, HOUR, DAY } from "../lib/rateLimit";
import { parseInput } from "../lib/validate";
import { simhashHex } from "../lib/simhash";
import { createBunnyVideo, createTusTicket, BunnyConfig } from "../lib/bunny";
import { District } from "../types";

const TICKET_TTL_MS = 30 * 60_000; // 30 minutes (spec §5)

const Input = z.object({
  districtId: z.string().min(1).max(64),
  headline: z.string().trim().min(10, "Headline must be at least 10 characters.").max(120),
  description: z.string().trim().max(2000).default(""),
  tags: z.array(z.string().trim().min(1).max(30)).max(5, "At most 5 tags.").default([]),
  category: z.enum(["civic", "crime", "politics", "sport", "weather"]),
  language: z.string().min(2).max(8).default("hi"),
});

/**
 * Mint a presigned Bunny TUS upload ticket and create the video row in
 * `encoding` (spec §5/§6). The file goes phone → Bunny directly; nothing streams
 * through Cloud Functions. Ticket expires in 30 minutes.
 */
export const createUploadTicket = onCall(
  { ...callableBase, secrets: [BUNNY_STREAM_API_KEY] },
  async (req) => {
    const uid = requireAuth(req);
    const input = parseInput(Input, req.data);

    const districtSnap = await db.doc(`districts/${input.districtId}`).get();
    if (!districtSnap.exists) throw new HttpsError("invalid-argument", "Unknown district.");
    const district = districtSnap.data() as District;
    if (district.status !== "active") throw new HttpsError("failed-precondition", "District is not active.");

    const membership = await requireRole(uid, district.tenantId, "reporter");

    await enforceRateLimit(uid, "createUploadTicket", 10, HOUR);
    await enforceRateLimit(uid, "createUploadTicket_day", 30, DAY);

    const userSnap = await db.doc(`users/${uid}`).get();
    const creatorHandle = (userSnap.get("handle") as string | null) ?? uid;
    const creatorName = (userSnap.get("displayName") as string | null) ?? "Reporter";

    const cfg: BunnyConfig = {
      libraryId: BUNNY_STREAM_LIBRARY_ID.value(),
      apiKey: BUNNY_STREAM_API_KEY.value(),
      cdnHostname: BUNNY_STREAM_CDN_HOSTNAME.value(),
    };
    const bunnyVideoId = await createBunnyVideo(cfg, input.headline);

    const videoRef = db.collection("videos").doc();
    await videoRef.set({
      tenantId: district.tenantId,
      districtId: input.districtId,
      creatorId: uid,
      creatorHandle,
      creatorName,
      creatorVerified: true,
      headline: input.headline,
      description: input.description,
      language: input.language,
      tags: input.tags,
      category: input.category,
      bunnyVideoId,
      playbackUrl: null,
      thumbnailUrl: null,
      durationSec: null,
      status: "encoding",
      isLive: false,
      autoFlags: [],
      titleHash: simhashHex(input.headline),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      rankScore: 0,
      trustScoreAtUpload: membership.trustScore,
      createdAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });

    const ticket = createTusTicket(cfg, bunnyVideoId, TICKET_TTL_MS);
    return {
      videoId: videoRef.id,
      bunnyVideoId,
      uploadUrl: ticket.uploadUrl,
      uploadHeaders: ticket.headers,
      expiresAt: ticket.expiresAt,
    };
  },
);
