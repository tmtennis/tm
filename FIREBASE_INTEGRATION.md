# Firebase Integration Guide

This guide explains how to integrate Firebase Authentication with the existing login modal in your TennisMenace application.

## Current Setup

The login modal is already implemented with:
- ✅ Email/Password authentication UI
- ✅ Google social login button
- ✅ Sign up and Sign in modes
- ✅ Password visibility toggle
- ✅ Loading states
- ✅ Form validation
- ✅ Responsive design

## Firebase Setup Steps

### 1. Install Firebase SDK

```bash
pnpm add firebase
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication in the Firebase console
4. Configure sign-in methods (Email/Password, Google)

### 3. Configure Environment Variables

Create a `.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Create Firebase Configuration

Create `lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### 5. Update LoginModal Component

Replace the TODO comments in `components/login-modal.tsx` with actual Firebase authentication:

```typescript
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// In the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  
  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
    } else {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    }
    // Close modal and handle success
  } catch (error) {
    console.error('Authentication error:', error)
    // Handle error (show toast, etc.)
  } finally {
    setIsLoading(false)
  }
}

// For Google authentication:
const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error('Google login error:', error)
  }
}

// For password reset:
const handlePasswordReset = async () => {
  try {
    await sendPasswordResetEmail(auth, formData.email)
    // Show success message
  } catch (error) {
    console.error('Password reset error:', error)
  }
}
```

### 6. Create Authentication Context

Create `contexts/auth-context.tsx` for managing authentication state:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 7. Update Layout

Wrap your app with the AuthProvider in `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/auth-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 8. Update Header to Show User State

Update the header in `app/page.tsx` to show the user's authentication state:

```typescript
import { useAuth } from '@/contexts/auth-context'

// In your component:
const { user, logout } = useAuth()

// Replace the login button with conditional rendering:
{user ? (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        {user.displayName || user.email}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={logout}>
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
  <LoginModal>
    <Button variant="outline">Log In</Button>
  </LoginModal>
)}
```

## Current Features Ready for Firebase

- ✅ Email/Password forms
- ✅ Google social login button
- ✅ Password reset functionality
- ✅ Loading states
- ✅ Error handling structure
- ✅ Responsive design
- ✅ Form validation

## Next Steps

1. Set up Firebase project and get configuration
2. Add environment variables
3. Replace TODO comments with actual Firebase calls
4. Test authentication flow
5. Add error handling and user feedback
6. Style authentication states in the UI

The login modal is fully prepared for Firebase integration - you just need to replace the console.log statements with actual Firebase authentication calls!
