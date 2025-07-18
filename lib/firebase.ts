// Updated Firebase configuration to ensure proper initialization and export auth instance
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Ensure all Firebase config values are loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.endsWith(".appspot.com") ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : "tmtennis-co.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log Firebase environment configuration for debugging
console.log("🔥 Firebase ENV CONFIG:", firebaseConfig);

// Prevent multiple initializations
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Only run analytics in the browser
if (typeof window !== "undefined") {
  getAnalytics(app);
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Add production console log for Firebase config
if (process.env.NODE_ENV === "production") {
  console.log("Firebase config:", firebaseConfig);
}

export { app, auth, db };
