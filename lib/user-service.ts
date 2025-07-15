import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export interface UserData {
  uid: string
  email: string
  displayName?: string
  isPremium: boolean
  stripeCustomerId?: string
  subscriptionId?: string
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid'
  subscriptionEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

export class UserService {
  private static COLLECTION_NAME = 'users'

  static async createUser(userData: Partial<UserData>): Promise<void> {
    if (!db || !userData.uid) return

    const userDoc = doc(db, this.COLLECTION_NAME, userData.uid)
    
    const data: Partial<UserData> = {
      ...userData,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(userDoc, data)
  }

  static async getUser(uid: string): Promise<UserData | null> {
    if (!db || !uid) return null

    const userDoc = doc(db, this.COLLECTION_NAME, uid)
    const docSnap = await getDoc(userDoc)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        subscriptionEndDate: data.subscriptionEndDate?.toDate()
      } as UserData
    }

    return null
  }

  static async updateUser(uid: string, updates: Partial<UserData>): Promise<void> {
    if (!db || !uid) return

    const userDoc = doc(db, this.COLLECTION_NAME, uid)
    await updateDoc(userDoc, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async updatePremiumStatus(
    uid: string, 
    isPremium: boolean,
    subscriptionData?: {
      stripeCustomerId?: string
      subscriptionId?: string
      subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid'
      subscriptionEndDate?: Date
    }
  ): Promise<void> {
    if (!db || !uid) return

    const updates: Partial<UserData> = {
      isPremium,
      ...subscriptionData,
      updatedAt: new Date()
    }

    await this.updateUser(uid, updates)
  }

  static async getUserByStripeCustomerId(customerId: string): Promise<UserData | null> {
    if (!db || !customerId) return null

    // Note: This would require a compound index in Firestore
    // For now, we'll store the user ID in Stripe metadata instead
    return null
  }
}
