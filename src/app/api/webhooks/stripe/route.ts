import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { message: 'Stripe not configured' },
        { status: 503 }
      )
    }
    
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    // Handle the event
    switch (event.type) {
      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        await handleSetupIntentSucceeded(setupIntent)
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent)
        break
      }
      
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        await handlePaymentMethodAttached(paymentMethod)
        break
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log('SetupIntent succeeded:', setupIntent.id)
  
  if (!stripe) {
    console.error('Stripe not configured')
    return
  }
  
  if (!setupIntent.payment_method || !setupIntent.customer) {
    return
  }
  
  // Get payment method details
  const paymentMethod = await stripe.paymentMethods.retrieve(
    setupIntent.payment_method as string
  )
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: setupIntent.customer as string },
  })
  
  if (!user) {
    console.error('User not found for customer:', setupIntent.customer)
    return
  }
  
  // Check if this is the first payment method
  const existingMethods = await prisma.paymentMethod.count({
    where: { userId: user.id },
  })
  
  // Save payment method to database
  await prisma.paymentMethod.create({
    data: {
      userId: user.id,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      isDefault: existingMethods === 0, // First payment method is default
    },
  })
  
  console.log('Payment method saved for user:', user.id)
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method attached:', paymentMethod.id)
  
  if (!paymentMethod.customer) {
    return
  }
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: paymentMethod.customer as string },
  })
  
  if (!user) {
    console.error('User not found for customer:', paymentMethod.customer)
    return
  }
  
  // Check if payment method already exists
  const existing = await prisma.paymentMethod.findUnique({
    where: { stripePaymentMethodId: paymentMethod.id },
  })
  
  if (existing) {
    return
  }
  
  // Check if this is the first payment method
  const existingMethods = await prisma.paymentMethod.count({
    where: { userId: user.id },
  })
  
  // Save payment method to database
  await prisma.paymentMethod.create({
    data: {
      userId: user.id,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      expMonth: paymentMethod.card?.exp_month,
      expYear: paymentMethod.card?.exp_year,
      isDefault: existingMethods === 0,
    },
  })
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('PaymentIntent succeeded:', paymentIntent.id)
  
  const orderId = paymentIntent.metadata.orderId
  
  if (!orderId) {
    console.error('No order ID in payment intent metadata')
    return
  }
  
  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'SUCCEEDED',
      paidAt: new Date(),
      status: 'PAID',
    },
  })
  
  console.log('Order marked as paid:', orderId)
  
  // TODO: Send confirmation email
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('PaymentIntent failed:', paymentIntent.id)
  
  const orderId = paymentIntent.metadata.orderId
  
  if (!orderId) {
    console.error('No order ID in payment intent metadata')
    return
  }
  
  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'FAILED',
    },
  })
  
  console.log('Order payment failed:', orderId)
  
  // TODO: Send payment failed email
}
