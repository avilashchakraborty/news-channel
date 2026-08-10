import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

// AES-256-GCM for reporter phone numbers (spec §5). The ciphertext is stored as
// phoneEncrypted and NEVER returned to clients; only phoneLast4 is displayable.
function keyBuffer(rawKey: string): Buffer {
  // Prefer a 64-char hex key; otherwise derive 32 bytes via SHA-256 so any
  // sufficiently random secret still yields a valid AES-256 key.
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) return Buffer.from(rawKey, "hex");
  return createHash("sha256").update(rawKey).digest();
}

export function encryptPhone(plain: string, rawKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuffer(rawKey), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decryptPhone(payload: string, rawKey: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed ciphertext.");
  const decipher = createDecipheriv("aes-256-gcm", keyBuffer(rawKey), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

// Deterministic hash used only to detect "another account already holds this
// phone" without storing the plaintext (spec §5 auto-checks).
export function phoneHash(normalizedPhone: string): string {
  return createHash("sha256").update(normalizedPhone).digest("hex");
}
