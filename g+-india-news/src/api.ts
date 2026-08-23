import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions, firebaseEnabled, DEFAULT_TENANT } from "./firebase";

export { firebaseEnabled, DEFAULT_TENANT };
export type { User };

// ---- Auth ----

export function onAuthChange(cb: (user: User | null) => void): () => void {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  const res = await signInWithPopup(auth, new GoogleAuthProvider());
  return res.user;
}

export async function signOutUser(): Promise<void> {
  if (auth) await signOut(auth);
}

// ---- Callables (all no-op → null when Firebase isn't configured) ----

function call<Req = unknown, Res = unknown>(name: string) {
  return async (data?: Req): Promise<Res | null> => {
    if (!functions) return null;
    try {
      const fn = httpsCallable(functions, name);
      const res = await fn((data ?? {}) as Record<string, unknown>);
      return res.data as Res;
    } catch (e) {
      console.warn(`callable ${name} failed`, e);
      return null;
    }
  };
}

export type FeedItem = {
  id: string;
  headline: string;
  creatorName: string;
  creatorHandle: string;
  districtId: string;
  category: string;
  tags: string[];
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  durationSec: number | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLive: boolean;
  publishedAt: number | null;
};

export const api = {
  getFeed: call<{ tenantId: string; districtId: string; scope?: string; cursor?: number | null; limit?: number }, { items: FeedItem[]; nextCursor: number | null }>("getFeed"),
  claimHandle: call<{ handle: string; displayName: string; homeDistrictId: string }, { handle: string }>("claimHandle"),
  createUploadTicket: call("createUploadTicket"),
  toggleLike: call<{ videoId: string }, { liked: boolean }>("toggleLike"),
  recordView: call("recordView"),
  getAds: call<{ tenantId: string; districtId?: string; category?: string; limit?: number }, { ads: unknown[] }>("getAds"),
  recordAdEvent: call<{ adId: string; type: "impression" | "click" }, { ok: boolean }>("recordAdEvent"),
  getCategories: call<{ tenantId: string }, { categories: { slug: string; label: string; emoji: string; color: string }[] }>("getCategories"),
  getAdPlacements: call<{ tenantId: string }, { placements: Record<string, boolean | number> }>("getAdPlacements"),
  createAdvertiserAccount: call("createAdvertiserAccount"),
  createCampaign: call("createCampaign"),
  createAd: call("createAd"),
  getAdvertiserDashboard: call("getAdvertiserDashboard"),
};
