# Premium Subscription Setup Guide

This guide explains the complete premium subscription system implemented in the TennisMenace app.

## Overview

The app now includes:
- User authentication with Firebase
- Premium subscription payments via Stripe
- Database integration with Firestore
- Premium content protection
- Automated subscription management

## Architecture

### 1. User Management (`lib/user-service.ts`)
- Creates and manages user profiles in Firestore
- Tracks premium subscription status
- Handles subscription metadata (customer ID, subscription ID, etc.)

### 2. Authentication (`contexts/auth-context.tsx`)
- Firebase authentication integration
- Automatic user creation in Firestore
- Premium status tracking in React context
- Auto-refresh of user data

### 3. Stripe Integration
- **Checkout Session API** (`app/api/create-checkout-session/route.ts`): Creates Stripe checkout sessions
- **Webhook Handler** (`app/api/stripe-webhook/route.ts`): Processes Stripe events and updates user status
- **Client Integration** (`lib/stripe-client.ts`): Frontend Stripe configuration

### 4. Premium Content Protection (`components/premium-content.tsx`)
- `PremiumContent` component wraps premium features
- Shows upgrade prompts for non-premium users
- Automatic fallback content for signed-out users

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Firebase Setup

1. Enable Authentication methods:
   - Email/Password
   - Google Sign-in
   
2. Create Firestore database with these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Stripe Setup

1. Create a product in Stripe with monthly pricing
2. Set up webhook endpoint: `https://your-domain.com/api/stripe-webhook`
3. Enable these webhook events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

### 4. Deployment

1. Deploy to Vercel
2. Add environment variables in Vercel dashboard
3. Update webhook endpoint URL in Stripe
4. Test the complete flow

## Usage

### Protecting Premium Content

```tsx
import { PremiumContent } from '@/components/premium-content'

function MyComponent() {
  return (
    <PremiumContent>
      <div>This content is only visible to premium users</div>
    </PremiumContent>
  )
}
```

### Custom Premium Checks

```tsx
import { usePremium } from '@/components/premium-content'

function MyComponent() {
  const { isPremium } = usePremium()
  
  return (
    <div>
      {isPremium ? (
        <div>Premium feature</div>
      ) : (
        <div>Sign up for premium</div>
      )}
    </div>
  )
}
```

### Accessing User Data

```tsx
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, userData, isPremium, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      {isPremium && <div>Premium features available</div>}
    </div>
  )
}
```

## Testing

### Local Testing
1. Use Stripe test keys in development
2. Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
3. Test with Stripe test card: `4242 4242 4242 4242`

### Production Testing
1. Use Stripe live keys
2. Set up production webhook endpoint
3. Test with real payment methods

## Troubleshooting

### Common Issues

1. **Webhook not working**: Check webhook URL and secret
2. **User not getting premium**: Check webhook events are enabled
3. **Premium content not showing**: Verify user data refresh
4. **Payment fails**: Check Stripe keys and configuration

### Debug Steps

1. Check browser console for Firebase/Stripe errors
2. Monitor Stripe webhook logs
3. Check Firestore for user data
4. Verify environment variables are set

## Files Modified/Created

- `lib/user-service.ts` - User management service
- `contexts/auth-context.tsx` - Updated with premium status
- `components/premium-content.tsx` - Premium content wrapper
- `components/premium-upgrade.tsx` - Upgrade button
- `components/user-dropdown.tsx` - Updated with premium badge
- `app/api/stripe-webhook/route.ts` - Updated webhook handler
- `app/success/page.tsx` - Payment success page
- `app/cancel/page.tsx` - Payment cancelled page
- `app/page.tsx` - Updated with premium content examples

## Next Steps

1. Add more premium features throughout the app
2. Implement subscription management (cancel, upgrade, etc.)
3. Add email notifications for subscription events
4. Implement usage tracking and analytics
5. Add admin panel for user management
