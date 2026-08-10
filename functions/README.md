# G+ India News — Backend

Firebase Cloud Functions (v2, Node 20, TypeScript) + Firestore for the G+ India
News platform. Implements the backend spec: identity, the Bunny Stream video
pipeline, moderation, the ranked feed, sharded counters, reporter onboarding,
admin/tenant management, scheduled jobs, and rate limits.

Region for everything: **`asia-south1` (Mumbai)**.

## Layout

```
firebase.json            emulator + deploy config
firestore.rules          security rules (tenant-scoped, function-only writes)
firestore.indexes.json   composite indexes
functions/
  src/
    config.ts            region, params, secrets, callable base options
    types.ts             Firestore document types
    index.ts             function exports (Firebase discovers these)
    lib/                 auth, rateLimit, shards, crypto, simhash, ranking,
                         bunny, cloudinary, revalidate, notify, spam, batch,
                         validate, firestore
    identity/            onUserCreate, claimHandle, deleteAccount
    video/               createUploadTicket, bunnyWebhook, onVideoPending,
                         claimQueueItem, moderateVideo, onVideoPublished
    engagement/          toggleLike, recordView, onCommentCreate
    feed/                getFeed
    reporter/            requestReporterRole, reviewReporterRequest
    admin/               setMembershipRole, suspendUser, createTenant,
                         updateTenantBranding
    scheduled/           aggregateCounters, recomputeRankScores,
                         releaseStaleClaims, expireUploadTickets,
                         rollupDailyStats, decayTrustScores,
                         purgeDeletedAccounts, endStaleLiveStreams
  test/                  emulator rules tests + pure-logic unit tests
```

## Setup

```bash
cd functions
npm install
```

### Secrets (production)

Set each as a Cloud Functions secret:

```bash
firebase functions:secrets:set BUNNY_STREAM_API_KEY
firebase functions:secrets:set BUNNY_WEBHOOK_SECRET
firebase functions:secrets:set BUNNY_TOKEN_AUTH_KEY        # optional (signed playback)
firebase functions:secrets:set CLOUDINARY_API_KEY
firebase functions:secrets:set CLOUDINARY_API_SECRET
firebase functions:secrets:set VERCEL_REVALIDATE_SECRET
firebase functions:secrets:set PHONE_ENCRYPTION_KEY        # 32-byte AES key (hex preferred)
```

Non-secret params (`BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_CDN_HOSTNAME`,
`CLOUDINARY_CLOUD_NAME`, `VERCEL_REVALIDATE_URL`) can be set via
`.env` (see `.env.example`) or `firebase functions:config`/params.

### App Check

Turn on App Check (Play Integrity on Android, reCAPTCHA Enterprise on web)
before launch. **Every callable enforces it** (`enforceAppCheck: true`). Without
it, `recordView`/`toggleLike` are trivially scriptable.

## Develop, test, deploy

```bash
npm run build         # tsc → lib/
npm run serve         # build + emulators (functions, firestore, auth)
npm test              # emulator security-rules tests + unit tests
firebase deploy --only functions,firestore:rules,firestore:indexes
```

## Data model notes

- **`role` never lives on `users`.** All authorization is in
  `memberships/{uid}_{tenantId}`. Every check reads that document; tenant is
  checked before role, always.
- **Sharded counters** (`viewShards`/`likeShards`/`commentShards`, 10 each) keep
  hot videos under Firestore's ~1 write/s/document ceiling. `aggregateCounters`
  sums them into the parent every 5 min. Views are eventually consistent.
- **Uploads never pass through Cloud Functions.** `createUploadTicket` returns a
  presigned Bunny **TUS** ticket; the phone uploads straight to Bunny.

## Deviations from the spec (and why)

These are small, deliberate corrections/additions — call them out in review:

1. **`reports` read/update rule** uses `resource.data.tenantId` (the spec text
   used `request.resource.data.tenantId`, which is null on reads and would deny
   every read).
2. **Added rule blocks** the spec's data model referenced but the sample rules
   omitted: `districts` (read-mostly), the counter-shard subcollections
   (function-only), and `rateLimits` (server-only).
3. **`following` docs carry a `creatorId` field** so follower fan-out works via a
   `following` collection-group index. The client must include it when writing
   `users/{uid}/following/{creatorId}`.
4. **ID-proof handling:** `requestReporterRole` stores the Cloudinary
   *authenticated* public id in `idProofUrl`; moderators get a short-lived signed
   URL on demand (never a public URL). `phoneEncrypted` is written server-side
   and never returned to clients — list calls expose `phoneLast4` only.
5. **`nameMatch`** compares an optional `idName` (as printed on the ID) against
   the profile name; without OCR wired, absent `idName` is treated as a pass.
6. **`endStaleLiveStreams`** has no Bunny live-status API available, so it uses a
   2-hour heuristic. Swap for a real liveness check when Bunny exposes one.
7. **FCM tokens** are expected at `users/{uid}/fcmTokens/{token}` (existence =
   registered), written client-side under the `users/{userId}/**` rule.

## Build order (spec §9)

Auth → video pipeline → moderation → feed/counters → reporter onboarding →
admin → scheduled jobs + rate limits + App Check → multi-tenant. The rules tests
in `test/rules.test.ts` cover the two cases the spec flags as most important:
cross-tenant queue isolation, and no self-promotion through direct membership
writes.
