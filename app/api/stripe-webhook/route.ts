import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { UserService } from '@/lib/user-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('Checkout session completed:', session.id)
      console.log('User ID from metadata:', session.metadata?.userId)
      
      if (session.metadata?.userId) {
        try {
          await UserService.updatePremiumStatus(
            session.metadata.userId,
            true,
            {
              stripeCustomerId: session.customer as string,
              subscriptionId: session.subscription as string,
              subscriptionStatus: 'active'
            }
          )
          console.log('User premium status updated successfully')
        } catch (error) {
          console.error('Error updating user premium status:', error)
        }
      }
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      console.log('Payment succeeded for invoice:', invoice.id)
      
      if (invoice.customer_email && invoice.lines?.data?.[0]?.subscription) {
        // Payment succeeded - ensure user has premium access
        try {
          const subscriptionId = invoice.lines.data[0].subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          if (subscription.metadata?.userId) {
            await UserService.updatePremiumStatus(
              subscription.metadata.userId,
              true,
              {
                stripeCustomerId: invoice.customer as string,
                subscriptionId: subscriptionId,
                subscriptionStatus: 'active'
              }
            )
            console.log('User premium status renewed successfully')
          }
        } catch (error) {
          console.error('Error renewing user premium status:', error)
        }
      }
      break

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      console.log('Subscription cancelled:', subscription.id)
      
      if (subscription.metadata?.userId) {
        try {
          await UserService.updatePremiumStatus(
            subscription.metadata.userId,
            false,
            {
              subscriptionStatus: 'canceled'
            }
          )
          console.log('User premium status revoked successfully')
        } catch (error) {
          console.error('Error revoking user premium status:', error)
        }
      }
      break

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription
      console.log('Subscription updated:', updatedSubscription.id)
      
      if (updatedSubscription.metadata?.userId) {
        try {
          const isPremium = updatedSubscription.status === 'active'
          await UserService.updatePremiumStatus(
            updatedSubscription.metadata.userId,
            isPremium,
            {
              subscriptionStatus: updatedSubscription.status as any,
              subscriptionEndDate: (updatedSubscription as any).current_period_end ? 
                new Date((updatedSubscription as any).current_period_end * 1000) : undefined
            }
          )
          console.log('User subscription status updated successfully')
        } catch (error) {
          console.error('Error updating user subscription status:', error)
        }
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
