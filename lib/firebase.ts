// Updated Firebase configuration with correct domain
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "tmtennis.co",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Only initialize Firebase once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Only run analytics in the browser
if (typeof window !== 'undefined') {
  getAnalytics(app)
}

// Initialize Firebase Auth with persistence
const auth = getAuth(app)

// Set auth persistence to keep users logged in
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error)
  })
}

// Initialize Firestore
const db = getFirestore(app)

export { auth, db }
export default app
