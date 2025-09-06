import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnFstb0vA59ZEVVLHuAkuevtYjL1fkLwU",
  authDomain: "bio-planters.firebaseapp.com",
  projectId: "bio-planters",
  storageBucket: "bio-planters.firebasestorage.app",
  messagingSenderId: "701085761259",
  appId: "1:701085761259:web:34364b9425d601a943c8ae",
  measurementId: "G-50BRER9F3L"
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
