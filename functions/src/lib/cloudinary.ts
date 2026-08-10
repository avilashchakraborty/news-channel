import { v2 as cloudinary } from "cloudinary";

// ID proofs are uploaded as `authenticated` (private) Cloudinary assets and
// only ever delivered through short-lived signed URLs (spec §2 idProofUrl).
export function configureCloudinary(cloudName: string, apiKey: string, apiSecret: string): typeof cloudinary {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

export function signedIdProofUrl(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string,
  ttlMs: number,
): string {
  const c = configureCloudinary(cloudName, apiKey, apiSecret);
  return c.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: Math.floor((Date.now() + ttlMs) / 1000),
  });
}
