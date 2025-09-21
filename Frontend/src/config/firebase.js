import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Values should be supplied via environment variables (Vite: VITE_*). Hardcoded fallbacks are for local dev only.
// Provided Firebase Project ID: carrergenie-55e58
// NEVER commit real apiKey overrides produced for production into source control.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Required
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carrergenie-55e58.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://carrergenie-55e58.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carrergenie-55e58",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carrergenie-55e58.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
