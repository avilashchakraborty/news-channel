import { z } from "zod";
import { HttpsError } from "firebase-functions/v2/https";

// Every callable validates its input with Zod before touching Firestore
// (spec §5). parseInput turns a Zod failure into an invalid-argument HttpsError.
export function parseInput<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError("invalid-argument", result.error.issues.map((i) => i.message).join("; "));
  }
  return result.data;
}

// Handles are lowercase, 4–20 chars, alphanumerics + underscore, with a denylist
// of reserved words (spec §5 claimHandle).
export const HANDLE_DENYLIST = new Set([
  "admin",
  "administrator",
  "support",
  "help",
  "root",
  "system",
  "gplus",
  "moderator",
  "superadmin",
  "official",
  "staff",
  "team",
  "news",
]);

export function normalizeHandle(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function assertHandleAllowed(handle: string): void {
  if (handle.length < 4 || handle.length > 20) {
    throw new HttpsError("invalid-argument", "Handle must be 4–20 characters.");
  }
  if (HANDLE_DENYLIST.has(handle)) {
    throw new HttpsError("invalid-argument", "That handle is reserved.");
  }
}

// Normalize an Indian mobile number to +91XXXXXXXXXX; reject anything else.
export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) {
    throw new HttpsError("invalid-argument", "Enter a valid 10-digit Indian mobile number.");
  }
  return `+91${local}`;
}

// Case/space-insensitive token overlap between the ID name and the profile name
// (spec §5 nameMatch auto-check). Returns true when a majority of profile tokens
// appear in the ID name.
export function namesRoughlyMatch(idName: string, profileName: string): boolean {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const idTokens = new Set(norm(idName));
  const profileTokens = norm(profileName);
  if (profileTokens.length === 0) return false;
  const hits = profileTokens.filter((t) => idTokens.has(t)).length;
  return hits / profileTokens.length >= 0.5;
}
