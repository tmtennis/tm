"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Crown, Loader2 } from 'lucide-react'
import { getStripe } from '@/lib/stripe-client'

export function PremiumUpgrade() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) return

    setIsLoading(true)
    
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      
      if (!data.sessionId) {
        throw new Error('No session ID received from server')
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      
      if (!stripe) {
        throw new Error('Stripe not initialized')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        console.error('Stripe redirect error:', error)
        throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // You might want to show a toast or error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleUpgrade}
      disabled={isLoading || !user}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </>
      )}
    </Button>
  )
}
