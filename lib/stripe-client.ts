import { loadStripe } from '@stripe/stripe-js'

export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  if (!publishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
    return null
  }
  
  return loadStripe(publishableKey)
}
