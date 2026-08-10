// Lightweight comment spam heuristics (spec §5 onCommentCreate). A hit hides
// the comment (status: 'hidden') rather than deleting it, so moderators can
// still review. Multilingual (Hindi/English/Bengali) profanity is a short seed
// list — swap for a maintained list/service in production.
const PROFANITY = [
  // English
  "fuck", "shit", "bitch", "asshole", "bastard",
  // Hindi (romanized)
  "bhosdi", "madarchod", "behenchod", "chutiya", "gaandu", "randi",
  // Bengali (romanized)
  "banchod", "khanki", "magi",
];

const URL_RE = /(https?:\/\/|www\.)\S+/gi;

export type SpamVerdict = { spam: boolean; reason: string | null };

export function checkCommentSpam(body: string): SpamVerdict {
  const text = body.trim();
  const lower = text.toLowerCase();

  // Link density: 2+ links, or a link in a very short comment, reads as spam.
  const links = lower.match(URL_RE) ?? [];
  if (links.length >= 2) return { spam: true, reason: "link_density" };
  if (links.length === 1 && text.length < 40) return { spam: true, reason: "link_only" };

  // Repeated text: one token repeated, or a long run of one character.
  if (/(.)\1{9,}/.test(text)) return { spam: true, reason: "char_flood" };
  const tokens = lower.split(/\s+/).filter(Boolean);
  if (tokens.length >= 5 && new Set(tokens).size === 1) return { spam: true, reason: "token_flood" };

  // Profanity list (word-ish boundary match on the normalized text).
  const norm = lower.replace(/[^\p{L}\p{N}\s]/gu, " ");
  if (PROFANITY.some((w) => new RegExp(`(^|\\s)${w}`, "u").test(norm))) {
    return { spam: true, reason: "profanity" };
  }

  return { spam: false, reason: null };
}
