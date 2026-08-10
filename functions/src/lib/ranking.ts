// Feed ranking (spec §5). Recomputed on publish and hourly for videos
// published in the last 72h.
export type RankInputs = {
  views: number;
  likes: number;
  comments: number;
  creatorTrust: number; // 0–100
  publishedAtMs: number;
  nowMs: number;
};

export function computeRankScore(i: RankInputs): number {
  const hours = Math.max(0, (i.nowMs - i.publishedAtMs) / 3_600_000);
  const freshness = Math.max(0, 1 - hours / 72);
  return (
    Math.log10(i.views + 1) * 0.3 +
    Math.log10(i.likes + 1) * 0.25 +
    Math.log10(i.comments + 1) * 0.15 +
    (i.creatorTrust / 100) * 0.15 +
    freshness * 0.15
  );
}
