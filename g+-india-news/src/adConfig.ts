// Ad-placement settings the admin controls. The portal reads these to decide
// where (and how often) Sponsored cards appear. In production these persist via
// updateAdPlacements() into adSettings/{tenantId}; here they live in App state.

export type AdPlacements = {
  homeSponsored: boolean; // Sponsored cards in home feed sections
  frequency: number; // insert one after every N cards
  districtPages: boolean; // Sponsored cards on district/tag pages
  videoDetail: boolean; // Sponsored card on the video page
  inFeed: boolean; // full-screen sponsored video in the mobile feed
  banner: boolean; // banner strip between home sections
};

export const DEFAULT_AD_PLACEMENTS: AdPlacements = {
  homeSponsored: true,
  frequency: 5,
  districtPages: true,
  videoDetail: true,
  inFeed: false,
  banner: false,
};

export type SponsoredAd = {
  headline: string;
  advertiser: string;
  cta: string;
  url: string;
  seed: string;
};

// Sample house ad shown where real ads (from getAds) will render once wired.
export const SAMPLE_SPONSORED: SponsoredAd = {
  headline: "Biggest Puja offers at City Centre — up to 60% off",
  advertiser: "Durgapur Traders Association",
  cta: "Shop now",
  url: "https://example.com/puja",
  seed: "sponsored-puja",
};
