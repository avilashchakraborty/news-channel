import { onRequest } from "firebase-functions/v2/https";
import {
  REGION,
  BUNNY_WEBHOOK_SECRET,
  BUNNY_STREAM_API_KEY,
  BUNNY_STREAM_LIBRARY_ID,
  BUNNY_STREAM_CDN_HOSTNAME,
} from "../config";
import { db } from "../lib/firestore";
import {
  BunnyConfig,
  BunnyVideoDetails,
  verifyBunnyWebhook,
  getBunnyVideo,
  playbackUrl,
  thumbnailUrl,
} from "../lib/bunny";
import { sendToUser } from "../lib/notify";

// Bunny status codes we care about.
const STATUS_FINISHED = 4;
const STATUS_ERROR = 5;

/**
 * Public HTTPS endpoint for Bunny Stream (spec §5). Verifies the HMAC and
 * rejects anything that fails — this URL is public and will be probed. Handles
 * VideoEncoded → `pending` and VideoFailed → `draft`. Idempotent: Bunny retries
 * and re-delivers, so a video already past `encoding` is left alone.
 */
export const bunnyWebhook = onRequest(
  {
    region: REGION,
    secrets: [BUNNY_WEBHOOK_SECRET, BUNNY_STREAM_API_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const signature = (req.get("x-bunny-signature") || req.get("bunny-signature") || "").trim();
    const rawBody: Buffer = (req as unknown as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));
    if (!verifyBunnyWebhook(rawBody, signature, BUNNY_WEBHOOK_SECRET.value())) {
      res.status(401).send("Invalid signature");
      return;
    }

    const body = req.body as Record<string, unknown>;
    const guid = String(body.VideoGuid ?? body.videoGuid ?? body.videoId ?? "");
    if (!guid) {
      res.status(400).send("Missing VideoGuid");
      return;
    }

    const eventName = String(body.event ?? body.Event ?? body.status ?? "");
    const statusCode = Number(body.Status ?? body.status ?? NaN);
    const isEncoded = eventName === "VideoEncoded" || statusCode === STATUS_FINISHED;
    const isFailed = eventName === "VideoFailed" || statusCode === STATUS_ERROR;

    const match = await db.collection("videos").where("bunnyVideoId", "==", guid).limit(1).get();
    if (match.empty) {
      // Nothing to do, but 200 so Bunny stops retrying an unknown video.
      res.status(200).send("No matching video");
      return;
    }
    const videoRef = match.docs[0].ref;

    const cfg: BunnyConfig = {
      libraryId: BUNNY_STREAM_LIBRARY_ID.value(),
      apiKey: BUNNY_STREAM_API_KEY.value(),
      cdnHostname: BUNNY_STREAM_CDN_HOSTNAME.value(),
    };

    if (isEncoded) {
      let details: BunnyVideoDetails | undefined;
      try {
        details = await getBunnyVideo(cfg, guid);
      } catch (e) {
        console.error("getBunnyVideo failed", e);
      }
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(videoRef);
        if (!snap.exists) return;
        // Idempotency: only advance a video that is still encoding.
        if (snap.get("status") !== "encoding") return;
        tx.update(videoRef, {
          status: "pending",
          playbackUrl: playbackUrl(cfg, guid),
          thumbnailUrl: thumbnailUrl(cfg, guid),
          durationSec: details?.length ?? null,
          encodeMeta: details
            ? {
                hasAudio: details.hasAudio,
                width: details.width,
                height: details.height,
                availableResolutions: details.availableResolutions,
              }
            : null,
        });
      });
    } else if (isFailed) {
      const creatorId = match.docs[0].get("creatorId") as string;
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(videoRef);
        if (!snap.exists) return;
        if (snap.get("status") === "published") return; // never regress a live video
        tx.update(videoRef, { status: "draft" });
      });
      await sendToUser(
        creatorId,
        "Upload didn't process",
        "Your video couldn't be encoded. Open the app to retry the upload.",
        { videoId: videoRef.id, kind: "video_failed" },
      );
    }

    res.status(200).send("ok");
  },
);
