import { createHash, createHmac, timingSafeEqual } from "crypto";

// Bunny Stream REST client. Node 20 has global fetch, so no SDK needed.
// The upload never passes through Cloud Functions — we hand the phone a
// presigned TUS ticket and the file goes phone → Bunny directly (spec §6).
export type BunnyConfig = {
  libraryId: string;
  apiKey: string;
  cdnHostname: string;
};

const API_BASE = "https://video.bunnycdn.com/library";
const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

export async function createBunnyVideo(cfg: BunnyConfig, title: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${cfg.libraryId}/videos`, {
    method: "POST",
    headers: { AccessKey: cfg.apiKey, "content-type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Bunny createVideo failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { guid: string };
  return data.guid;
}

export async function deleteBunnyVideo(cfg: BunnyConfig, videoGuid: string): Promise<void> {
  await fetch(`${API_BASE}/${cfg.libraryId}/videos/${videoGuid}`, {
    method: "DELETE",
    headers: { AccessKey: cfg.apiKey },
  });
}

export type BunnyVideoDetails = {
  guid: string;
  length: number; // seconds
  status: number; // Bunny status code (4 = Finished, 5 = Error)
  width: number;
  height: number;
  availableResolutions: string;
  hasAudio: boolean | null; // null when Bunny doesn't report it
};

export async function getBunnyVideo(cfg: BunnyConfig, videoGuid: string): Promise<BunnyVideoDetails> {
  const res = await fetch(`${API_BASE}/${cfg.libraryId}/videos/${videoGuid}`, {
    headers: { AccessKey: cfg.apiKey },
  });
  if (!res.ok) throw new Error(`Bunny getVideo failed: ${res.status} ${await res.text()}`);
  const d = (await res.json()) as Record<string, unknown>;
  let hasAudio: boolean | null = null;
  if (typeof d.hasAudio === "boolean") hasAudio = d.hasAudio;
  else if (Array.isArray(d.audioTracks)) hasAudio = (d.audioTracks as unknown[]).length > 0;
  return {
    guid: String(d.guid ?? videoGuid),
    length: Number(d.length ?? 0),
    status: Number(d.status ?? 0),
    width: Number(d.width ?? 0),
    height: Number(d.height ?? 0),
    availableResolutions: String(d.availableResolutions ?? ""),
    hasAudio,
  };
}

export type TusTicket = {
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: number; // ms epoch
};

/**
 * Presigned TUS upload ticket. Bunny's AuthorizationSignature is
 * sha256(libraryId + apiKey + expires + videoId). The client sends these as
 * TUS headers; the raw API key never leaves the server.
 */
export function createTusTicket(cfg: BunnyConfig, videoGuid: string, ttlMs: number): TusTicket {
  const expires = Math.floor((Date.now() + ttlMs) / 1000);
  const signature = createHash("sha256")
    .update(cfg.libraryId + cfg.apiKey + expires + videoGuid)
    .digest("hex");
  return {
    uploadUrl: TUS_ENDPOINT,
    headers: {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expires),
      VideoId: videoGuid,
      LibraryId: cfg.libraryId,
    },
    expiresAt: expires * 1000,
  };
}

export function playbackUrl(cfg: BunnyConfig, videoGuid: string): string {
  return `https://${cfg.cdnHostname}/${videoGuid}/playlist.m3u8`;
}

export function thumbnailUrl(cfg: BunnyConfig, videoGuid: string): string {
  return `https://${cfg.cdnHostname}/${videoGuid}/thumbnail.jpg`;
}

/**
 * Token-authenticated playback URL so .m3u8 links can't be hotlinked
 * (spec §6). TTL default 4h; mint fresh in getFeed. Requires Bunny CDN token
 * authentication to be enabled with the matching key.
 */
export function signedPlaybackUrl(
  cfg: BunnyConfig,
  videoGuid: string,
  tokenKey: string,
  ttlMs: number,
): string {
  const path = `/${videoGuid}/playlist.m3u8`;
  const expires = Math.floor((Date.now() + ttlMs) / 1000);
  const token = createHash("sha256")
    .update(tokenKey + path + expires)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `https://${cfg.cdnHostname}${path}?token=${token}&expires=${expires}`;
}

/**
 * Verify the webhook HMAC against BUNNY_WEBHOOK_SECRET (spec §5). This endpoint
 * is public and will be probed — anything that fails is rejected. Uses a
 * constant-time compare. `signatureHeader` is the hex HMAC-SHA256 of the raw body.
 */
export function verifyBunnyWebhook(rawBody: Buffer | string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}
