import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDAScRtbQl2FOsV5FCIp8adkHdND0ghYuA",
  authDomain: "tmtennis.co",
  projectId: "tmtennis-co",
  storageBucket: "tmtennis-co.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

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
