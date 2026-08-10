import { describe, expect, it } from "vitest";
import { computeRankScore } from "../src/lib/ranking";
import { simhashHex, hamming } from "../src/lib/simhash";
import { checkCommentSpam } from "../src/lib/spam";
import { normalizeHandle, namesRoughlyMatch, normalizeIndianPhone } from "../src/lib/validate";

// Pure-logic tests — no emulator or admin SDK needed.

describe("ranking", () => {
  it("fresher, more-engaged videos rank higher", () => {
    const now = Date.now();
    const fresh = computeRankScore({ views: 1000, likes: 200, comments: 50, creatorTrust: 90, publishedAtMs: now, nowMs: now });
    const stale = computeRankScore({ views: 10, likes: 1, comments: 0, creatorTrust: 40, publishedAtMs: now - 80 * 3_600_000, nowMs: now });
    expect(fresh).toBeGreaterThan(stale);
  });

  it("freshness floors at zero past 72h", () => {
    const now = Date.now();
    const a = computeRankScore({ views: 0, likes: 0, comments: 0, creatorTrust: 0, publishedAtMs: now - 100 * 3_600_000, nowMs: now });
    expect(a).toBe(0);
  });
});

describe("simhash duplicate detection", () => {
  it("near-identical headlines are within Hamming distance 3", () => {
    const a = simhashHex("Road caves in near Durgapur Steel Plant");
    const b = simhashHex("Road caves in near the Durgapur Steel Plant");
    expect(hamming(a, b)).toBeLessThanOrEqual(3);
  });

  it("unrelated headlines are far apart", () => {
    const a = simhashHex("Traders protest at Benachity market");
    const b = simhashHex("Metro services extended on the Green Line");
    expect(hamming(a, b)).toBeGreaterThan(3);
  });
});

describe("comment spam", () => {
  it("flags multiple links", () => {
    expect(checkCommentSpam("buy now http://a.com and http://b.com").spam).toBe(true);
  });
  it("passes a normal comment", () => {
    expect(checkCommentSpam("Great reporting, this really helped our area.").spam).toBe(false);
  });
});

describe("validation helpers", () => {
  it("normalizes handles", () => {
    expect(normalizeHandle("Balram.Singh!")).toBe("balramsingh");
  });
  it("normalizes Indian phone numbers", () => {
    expect(normalizeIndianPhone("098765 43210")).toBe("+919876543210");
  });
  it("matches names loosely", () => {
    expect(namesRoughlyMatch("Balram Kumar Singh", "Balram Singh")).toBe(true);
    expect(namesRoughlyMatch("Someone Else", "Balram Singh")).toBe(false);
  });
});
