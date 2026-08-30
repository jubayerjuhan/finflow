import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

let auth: Auth;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  // NEXT_PUBLIC_FIREBASE_* env vars aren't set yet. Defer the failure to the
  // moment something actually tries to use auth, instead of crashing every
  // page at import time (this module is imported transitively by lib/axios.ts).
  auth = new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Firebase is not configured — set the NEXT_PUBLIC_FIREBASE_* environment variables.'
        );
      },
    }
  ) as Auth;
}

export { auth };
export const googleProvider = new GoogleAuthProvider();
