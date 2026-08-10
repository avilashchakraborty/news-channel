import { defineSecret, defineString } from "firebase-functions/params";
import type { CallableOptions } from "firebase-functions/v2/https";

// All functions and Firestore run in Mumbai. Anything else adds 80–150ms
// per call for Indian users (see spec §1).
export const REGION = "asia-south1";

// New Google sign-ups land in this tenant as a viewer.
export const DEFAULT_TENANT_ID = "gplus";

// --- Non-secret config (safe to expose in logs) ---
export const BUNNY_STREAM_LIBRARY_ID = defineString("BUNNY_STREAM_LIBRARY_ID");
export const BUNNY_STREAM_CDN_HOSTNAME = defineString("BUNNY_STREAM_CDN_HOSTNAME");
export const CLOUDINARY_CLOUD_NAME = defineString("CLOUDINARY_CLOUD_NAME");
export const VERCEL_REVALIDATE_URL = defineString("VERCEL_REVALIDATE_URL");

// --- Secrets (backed by Secret Manager) ---
export const BUNNY_STREAM_API_KEY = defineSecret("BUNNY_STREAM_API_KEY");
export const BUNNY_WEBHOOK_SECRET = defineSecret("BUNNY_WEBHOOK_SECRET");
export const BUNNY_TOKEN_AUTH_KEY = defineSecret("BUNNY_TOKEN_AUTH_KEY");
export const CLOUDINARY_API_KEY = defineSecret("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = defineSecret("CLOUDINARY_API_SECRET");
export const VERCEL_REVALIDATE_SECRET = defineSecret("VERCEL_REVALIDATE_SECRET");
export const PHONE_ENCRYPTION_KEY = defineSecret("PHONE_ENCRYPTION_KEY");

// Base options every callable shares. App Check is enforced everywhere:
// without it, recordView and toggleLike are trivially scriptable (spec §1).
export const callableBase: CallableOptions = {
  region: REGION,
  enforceAppCheck: true,
};
