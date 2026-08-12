import { Timestamp } from "firebase-admin/firestore";

export type Role = "viewer" | "reporter" | "moderator" | "admin" | "superadmin";

export type Tenant = {
  name: string;
  slug: string;
  brandColor: string;
  logoSvg: string;
  tagline: string;
  districts: string[];
  status: "active" | "suspended";
  createdAt: Timestamp;
};

export type District = {
  tenantId: string;
  name: string;
  nameLocal: Record<string, string>;
  stateId: string;
  geohashPrefix: string;
  videoCount: number;
  status: "active" | "archived";
};

export type User = {
  email: string;
  displayName: string;
  handle: string | null;
  avatarInitial: string;
  photoURL: string | null;
  defaultTenantId: string;
  homeDistrictId: string | null;
  languages: string[];
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
};

export type UsernameLock = { uid: string; createdAt: Timestamp };

export type Membership = {
  uid: string;
  tenantId: string;
  role: Role;
  districtScope: string[];
  trustScore: number;
  status: "active" | "suspended";
  publishedCount: number;
  rejectedCount: number;
  addedBy: string | null;
  createdAt: Timestamp;
};

export type VideoStatus =
  | "draft"
  | "encoding"
  | "pending"
  | "published"
  | "rejected"
  | "removed";

export type VideoCategory = "civic" | "crime" | "politics" | "sport" | "weather";

export type Video = {
  tenantId: string;
  districtId: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorVerified: boolean;
  headline: string;
  description: string;
  language: string;
  tags: string[];
  category: VideoCategory;
  bunnyVideoId: string;
  playbackUrl: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  status: VideoStatus;
  isLive: boolean;
  autoFlags: string[];
  titleHash: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  rankScore: number;
  createdAt: Timestamp;
  publishedAt: Timestamp | null;
};

export type QueueItem = {
  videoId: string;
  tenantId: string;
  districtId: string;
  creatorId: string;
  headline: string;
  thumbnailUrl: string | null;
  durationSec: number;
  autoFlags: string[];
  status: "waiting" | "in_review" | "done";
  claimedBy: string | null;
  claimedUntil: Timestamp | null;
  submittedAt: Timestamp;
};

export type ModerationAction = {
  videoId: string;
  tenantId: string;
  districtId: string;
  moderatorId: string;
  action: "approve" | "reject" | "escalate" | "remove" | "auto_approve";
  reason: string | null;
  note: string | null;
  trustDelta: number;
  at: Timestamp;
};

export type VerificationRequest = {
  uid: string;
  tenantId: string;
  districtId: string;
  phoneEncrypted: string;
  phoneLast4: string;
  phoneHash: string;
  idProofUrl: string;
  idProofType: string;
  sampleVideoId: string | null;
  autoChecks: { phoneVerified: boolean; noDuplicate: boolean; nameMatch: boolean };
  status: "waiting" | "approved" | "declined" | "more_info";
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Timestamp;
};

export type Comment = {
  uid: string;
  handle: string;
  displayName: string;
  body: string;
  likeCount: number;
  status: "visible" | "hidden";
  createdAt: Timestamp;
};

// categories/{tenantId}__{slug}
export type Category = {
  tenantId: string;
  slug: string;
  label: string;
  emoji: string;
  color: string;
  createdBy: string;
  status: "active" | "archived";
  createdAt: Timestamp;
};

// advertisers/{uid}_{tenantId}
export type Advertiser = {
  uid: string;
  tenantId: string;
  orgName: string;
  walletBalance: number;
  status: "active" | "suspended";
  createdAt: Timestamp;
};

// campaigns/{campaignId}
export type Campaign = {
  advertiserId: string;
  tenantId: string;
  name: string;
  objective: string;
  dailyBudget: number;
  districts: string[];
  categories: string[];
  start: string;
  end: string;
  status: "active" | "paused" | "ended";
  spend: number;
  impressions: number;
  clicks: number;
  createdAt: Timestamp;
};

// ads/{adId}
export type Ad = {
  campaignId: string;
  advertiserId: string;
  tenantId: string;
  headline: string;
  imageUrl: string;
  cta: string;
  url: string;
  format: string;
  status: "active" | "paused";
  review: "pending" | "approved" | "rejected";
  impressions: number;
  clicks: number;
  createdAt: Timestamp;
};
