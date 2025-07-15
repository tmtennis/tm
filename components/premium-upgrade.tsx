"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Crown, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({
        sessionId,
      })

      if (error) {
        console.error('Stripe redirect error:', error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
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
