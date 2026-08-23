# Connect the app to Firebase

The frontend already speaks Firebase. Until the env config below is set, the app
runs on built-in **sample data** (no Firebase calls). Fill in the config and the
same UI switches to **live** auth, feed, and functions.

Do these once. Steps 1–7 need your Firebase Console / CLI (they can't be
automated from here).

---

## 1. Create the Firebase project

1. https://console.firebase.google.com → **Add project** (e.g. `gplus-india-news`).
2. Set the default GCP region to **`asia-south1` (Mumbai)** when prompted.
3. Put your project id in `.firebaserc` (replace `gplus-india-news`).

## 2. Enable Authentication (Google)

Console → **Build → Authentication → Get started → Sign-in method →** enable
**Google**. Add your domains (localhost + your Vercel domain) under
**Settings → Authorized domains**.

## 3. Create Firestore

Console → **Build → Firestore Database → Create database** → **production mode**
→ location **`asia-south1`**.

## 4. Deploy rules, indexes, and functions

```bash
npm i -g firebase-tools
firebase login
firebase use gplus-india-news         # your project id

# Backend secrets (see functions/README.md)
cd functions && npm install && cd ..
firebase functions:secrets:set BUNNY_STREAM_API_KEY
firebase functions:secrets:set BUNNY_WEBHOOK_SECRET
firebase functions:secrets:set CLOUDINARY_API_KEY
firebase functions:secrets:set CLOUDINARY_API_SECRET
firebase functions:secrets:set VERCEL_REVALIDATE_SECRET
firebase functions:secrets:set PHONE_ENCRYPTION_KEY
# optional: BUNNY_TOKEN_AUTH_KEY

firebase deploy --only firestore:rules,firestore:indexes,functions
```

Set the non-secret params (`BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_CDN_HOSTNAME`,
`CLOUDINARY_CLOUD_NAME`, `VERCEL_REVALIDATE_URL`) in `functions/.env` or via
params before deploying.

> **First-run tip:** the callables enforce **App Check** (step 6). To test
> before wiring App Check, add `ENFORCE_APP_CHECK=false` to `functions/.env`,
> deploy, then remove it (defaults to enforced) once App Check is set up.

## 5. Web app config → env

Console → **Project settings → General → Your apps → Web app** → copy the config
into `g+-india-news/.env.local` (see `g+-india-news/.env.example`):

```
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=gplus-india-news.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gplus-india-news
VITE_FIREBASE_STORAGE_BUCKET=gplus-india-news.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=…
VITE_FIREBASE_APP_ID=…
VITE_FUNCTIONS_REGION=asia-south1
VITE_DEFAULT_TENANT=gplus
VITE_RECAPTCHA_SITE_KEY=…
```

**On Vercel:** add the same `VITE_*` variables under
**Project → Settings → Environment Variables**, then redeploy — otherwise the
live site stays on sample data.

## 6. App Check (reCAPTCHA v3)

1. https://www.google.com/recaptcha/admin → create a **v3** site key for your
   domains.
2. Console → **App Check** → register the Web app with that reCAPTCHA v3 key.
3. Put the site key in `VITE_RECAPTCHA_SITE_KEY`.
4. For localhost, set `VITE_APPCHECK_DEBUG=true`, run the app, copy the debug
   token printed in the console, and add it under App Check → **Manage debug
   tokens**.

## 7. Seed the first tenant, district, and admin

`getFeed` needs a tenant + district to exist. In the Firestore console, add:

- `tenants/gplus` → `{ name, slug: "gplus", brandColor: "#C8102E", tagline: "Sach Ka Saamna, Sach Ke Sath", districts: ["durgapur"], status: "active", createdAt: <now> }`
- `districts/durgapur` → `{ tenantId: "gplus", name: "Durgapur", nameLocal: {}, stateId: "west-bengal", geohashPrefix: "", videoCount: 0, status: "active" }`

Then sign in once (creates `users/{uid}` + a viewer membership), and in the
console upgrade yourself to superadmin:

- `memberships/{yourUid}_gplus` → set `role: "superadmin"`

After that you can create tenants/districts/reporters from the app and via the
admin functions.

---

## What's wired

- **Auth:** the sign-in screen's "Continue with Google" runs real Firebase
  Google sign-in when configured.
- **Feed:** the portal loads a district's published videos via `getFeed`,
  falling back to sample data when empty/unconfigured.
- **Callables** (`src/api.ts`): claimHandle, createUploadTicket, toggleLike,
  recordView, getAds, recordAdEvent, getCategories, getAdPlacements, advertiser
  functions — ready to call from the UI.

Video upload (Bunny TUS), moderation and advertiser writes flow through the
already-deployed Cloud Functions once the above is in place.
