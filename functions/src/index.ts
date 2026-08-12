// Entry point — Firebase discovers Cloud Functions from these exports.
// Build order follows spec §9.

// Identity
export { onUserCreate } from "./identity/onUserCreate";
export { claimHandle } from "./identity/claimHandle";
export { deleteAccount } from "./identity/deleteAccount";

// Video pipeline + moderation
export { createUploadTicket } from "./video/createUploadTicket";
export { bunnyWebhook } from "./video/bunnyWebhook";
export { onVideoPending } from "./video/onVideoPending";
export { claimQueueItem } from "./video/claimQueueItem";
export { moderateVideo } from "./video/moderateVideo";
export { onVideoPublished } from "./video/onVideoPublished";

// Engagement
export { toggleLike } from "./engagement/toggleLike";
export { recordView } from "./engagement/recordView";
export { onCommentCreate } from "./engagement/onCommentCreate";

// Feed
export { getFeed } from "./feed/getFeed";

// Reporter onboarding
export { requestReporterRole } from "./reporter/requestReporterRole";
export { reviewReporterRequest } from "./reporter/reviewReporterRequest";

// Admin + tenant
export { setMembershipRole } from "./admin/setMembershipRole";
export { suspendUser } from "./admin/suspendUser";
export { createTenant } from "./admin/createTenant";
export { updateTenantBranding } from "./admin/updateTenantBranding";

// Categories
export { createCategory, deleteCategory, getCategories } from "./categories";

// Ad placements
export { updateAdPlacements, getAdPlacements } from "./admin/adPlacements";

// Advertiser platform
export {
  createAdvertiserAccount,
  addFunds,
  createCampaign,
  updateCampaignStatus,
  createAd,
  updateAdStatus,
  reviewAd,
  getAdvertiserDashboard,
  getAds,
  recordAdEvent,
} from "./advertiser";

// Scheduled jobs
export {
  aggregateCounters,
  recomputeRankScores,
  releaseStaleClaims,
  expireUploadTickets,
  rollupDailyStats,
  decayTrustScores,
  purgeDeletedAccounts,
  endStaleLiveStreams,
} from "./scheduled";
