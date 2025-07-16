'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { UserService, UserData } from '@/lib/user-service'

interface AuthContextType {
  user: User | null
  userData: UserData | null
  isPremium: boolean
  loading: boolean
  authChecked: boolean
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isPremium: false,
  loading: true,
  authChecked: false,
  logout: async () => {},
  refreshUserData: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Updated AuthProvider to include authChecked state and delay rendering until Firebase initializes
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await UserService.getUser(user.uid)
        setUserData(data)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      }
    } else {
      setUserData(null)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) {
      setLoading(false)
      setAuthChecked(true)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        try {
          // Check if user exists in Firestore
          let userData = await UserService.getUser(user.uid)
          
          // If user doesn't exist, create them
          if (!userData) {
            await UserService.createUser({
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || undefined,
              isPremium: false
            })
            userData = await UserService.getUser(user.uid)
          }
          
          setUserData(userData)
        } catch (error) {
          console.error('Error handling user data:', error)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
      setAuthChecked(true)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    userData,
    isPremium: userData?.isPremium || false,
    loading,
    authChecked,
    logout,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {authChecked ? children : <div className="flex items-center justify-center min-h-screen">Loading...</div>}
    </AuthContext.Provider>
  )
}
