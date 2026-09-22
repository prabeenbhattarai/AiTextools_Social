import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Client-side Firebase config. All values are public (NEXT_PUBLIC_*) and safe
// to ship to the browser — security comes from Firestore rules + server checks,
// not from hiding these values.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/**
 * Returns the client Auth instance, initialising Firebase lazily on first use.
 * Lazy init avoids crashing server-side rendering of client components when the
 * public env vars are missing — Firebase is only touched in the browser when a
 * user actually signs in / out.
 */
export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp());
}
