import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TennisMenace Premium',
              description: 'Access to premium tennis predictions, AI insights, and exclusive features',
            },
            unit_amount: 2999, // $29.99 per month
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/premium/cancel`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
