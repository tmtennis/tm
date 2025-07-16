// Updated Firebase configuration to use environment variables and prevent multiple initializations
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tmtennis-co.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Log environment variables for debugging in production
console.log("Firebase Config:", firebaseConfig);

// Prevent multiple initializations
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Only run analytics in the browser
if (typeof window !== "undefined") {
  getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
