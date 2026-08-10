import { onCall } from "firebase-functions/v2/https";
import { z } from "zod";
import { callableBase } from "../config";
import { requireAuth } from "../lib/auth";
import { enforceRateLimit, HOUR } from "../lib/rateLimit";
import { parseInput } from "../lib/validate";
import { incrementShard } from "../lib/shards";

const MIN_WATCH_MS = 2000; // ignore accidental/scroll-past views (spec §5)

// Accepts a single view or a client-buffered batch (spec §5: the app flushes
// every 10 views or 30 seconds — one call per view would bankrupt you).
const Single = z.object({ videoId: z.string().min(1), watchedMs: z.number().nonnegative() });
const Input = z.union([Single, z.object({ views: z.array(Single).min(1).max(100) })]);

export const recordView = onCall(callableBase, async (req) => {
  const uid = requireAuth(req);
  const parsed = parseInput(Input, req.data);
  const views = "views" in parsed ? parsed.views : [parsed];

  // One flush = one call carrying up to ~10 views; this ceiling is a safety net.
  await enforceRateLimit(uid, "recordView", 1000, HOUR);

  const counts = new Map<string, number>();
  for (const v of views) {
    if (v.watchedMs < MIN_WATCH_MS) continue;
    counts.set(v.videoId, (counts.get(v.videoId) ?? 0) + 1);
  }

  await Promise.all([...counts.entries()].map(([videoId, n]) => incrementShard(videoId, "viewShards", n)));
  return { recorded: [...counts.values()].reduce((a, b) => a + b, 0) };
});
