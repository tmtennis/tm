import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const config = {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing',
      secretKey: process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing',
    },
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Present' : 'Missing',
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL ? 'Present' : 'Missing',
    }
  }

  const missingKeys = []
  
  // Check required keys
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) missingKeys.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  if (!process.env.STRIPE_SECRET_KEY) missingKeys.push('STRIPE_SECRET_KEY')
  if (!process.env.STRIPE_WEBHOOK_SECRET) missingKeys.push('STRIPE_WEBHOOK_SECRET')
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY')
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')

  return NextResponse.json({
    status: missingKeys.length === 0 ? 'healthy' : 'missing_config',
    config,
    missingKeys,
    timestamp: new Date().toISOString()
  })
}
