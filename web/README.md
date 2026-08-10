# G+ India News — Web (Next.js)

The public, SEO-first web surface for G+ India News. Server-rendered with the
App Router, reads published videos from Firestore (Firebase Admin) with a
built-in **sample-data fallback**, so it renders even before the backend is
populated or without credentials.

## What's here

- `app/page.tsx` — home portal (public.app-style): region nav, topic chips,
  service tiles, curated sections.
- `app/[tenant]/district/[districtId]` · `.../state/[stateId]` ·
  `.../tag/[tag]` — SEO landing pages, each with `generateMetadata`.
- `app/video/[videoId]` — video detail with OpenGraph/Twitter tags and
  `VideoObject` JSON-LD for rich results.
- `app/api/revalidate` — ISR hook the backend calls on publish
  (`VERCEL_REVALIDATE_URL` + `VERCEL_REVALIDATE_SECRET`).
- `app/robots.ts`, `app/sitemap.ts` — crawlability.

All pages use ISR (`revalidate = 300`); publishes trigger targeted revalidation.

## Run

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Environment (see `.env.example`): set `FIREBASE_SERVICE_ACCOUNT` (or
`GOOGLE_APPLICATION_CREDENTIALS`) for live data; `VERCEL_REVALIDATE_SECRET` must
match the backend; `NEXT_PUBLIC_DEFAULT_TENANT` defaults to `gplus`. With no
Firebase credentials the site serves sample content.

## Deploy (the migration switch)

The repo currently deploys the **Vite** app (`g+-india-news/`) via the root
`vercel.json`. This Next.js app is ready but **not wired to production yet** so
the live site stays up. To make it the site, do ONE of:

1. **Recommended — point Vercel at this folder.** In Vercel → Project →
   Settings → Build & Deployment, set **Root Directory = `web`** and remove the
   root `vercel.json` (or set Framework Preset = Next.js). Vercel's native
   Next.js builder handles SSR, ISR, and the revalidate route.
2. **Separate project.** Create a second Vercel project from the same repo with
   Root Directory `web` — preview the Next.js site on its own URL first, then
   switch domains when you're happy.

Then set `VERCEL_REVALIDATE_URL` in the backend to
`https://<this-app>/api/revalidate`.

## Follow-ups

- State pages filter by a `state` field that video docs don't carry yet; wire
  district→state enrichment (or denormalize `state` onto videos) for live state
  filtering. Sample data already demonstrates it.
- Real HLS playback: add `hls.js` in `VideoPlayer` for non-Safari browsers.
