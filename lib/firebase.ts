import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Debug logging for development
if (typeof window !== 'undefined') {
  console.log('Firebase config loaded:', {
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Present' : 'Missing',
    projectId: firebaseConfig.projectId ? 'Present' : 'Missing',
    storageBucket: firebaseConfig.storageBucket ? 'Present' : 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'Present' : 'Missing',
    appId: firebaseConfig.appId ? 'Present' : 'Missing'
  })
}

// Check if all required Firebase config values are present
const isFirebaseConfigValid = () => {
  const isValid = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  )
  
  if (typeof window !== 'undefined') {
    console.log('Firebase config is valid:', isValid)
  }
  
  return isValid
}

// Initialize Firebase only on client side and when config is valid
let app: any = null
let auth: any = null
let db: any = null

if (typeof window !== 'undefined' && isFirebaseConfigValid()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    console.log('Firebase initialized successfully!')
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
} else if (typeof window !== 'undefined') {
  console.error('Firebase config is invalid or missing')
}

export { auth, db }
export default app
