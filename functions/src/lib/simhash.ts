import { createHash } from "crypto";

// 64-bit simhash over headline word tokens, for near-duplicate detection
// (spec §5 DUPLICATE flag: Hamming distance ≤ 3). Firestore can't store bigint,
// so persist as a 16-char hex string (Video.titleHash) and rehydrate for compares.

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function tokenHash(tok: string): bigint {
  const digest = createHash("md5").update(tok).digest();
  let h = 0n;
  for (let i = 0; i < 8; i++) h = (h << 8n) | BigInt(digest[i]);
  return h;
}

export function simhash(text: string): bigint {
  const tokens = tokenize(text);
  const weights = new Array<number>(64).fill(0);
  for (const tok of tokens) {
    const h = tokenHash(tok);
    for (let i = 0; i < 64; i++) {
      weights[i] += ((h >> BigInt(i)) & 1n) === 1n ? 1 : -1;
    }
  }
  let out = 0n;
  for (let i = 0; i < 64; i++) if (weights[i] > 0) out |= 1n << BigInt(i);
  return out;
}

export function simhashHex(text: string): string {
  return simhash(text).toString(16).padStart(16, "0");
}

export function hamming(aHex: string, bHex: string): number {
  let x = BigInt("0x" + aHex) ^ BigInt("0x" + bHex);
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}
