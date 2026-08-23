import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Reads Firebase config from Vite env. With config unset, `firebaseEnabled` is
// false and the app runs on built-in sample data (no Firebase calls made).
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {};

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const REGION = env.VITE_FUNCTIONS_REGION || "asia-south1";
export const DEFAULT_TENANT = env.VITE_DEFAULT_TENANT || "gplus";
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let functionsInstance: Functions | null = null;

if (firebaseEnabled) {
  app = initializeApp(config as Record<string, string>);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  functionsInstance = getFunctions(app, REGION);

  // App Check — the callables enforce it, so a reCAPTCHA v3 key is required for
  // authenticated calls to succeed.
  const siteKey = env.VITE_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    if (env.VITE_APPCHECK_DEBUG === "true") {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e) {
      console.warn("App Check init failed", e);
    }
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const functions = functionsInstance;
