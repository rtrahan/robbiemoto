import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId },
    })
    
    if (!user) {
      // Create user if doesn't exist
      const clerkUser = await auth()
      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser.sessionClaims?.email as string,
        },
      })
    }
    
    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: user.clerkId,
        },
      })
      
      stripeCustomerId = customer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }
    
    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId: user.id,
      },
    })
    
    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    })
  } catch (error) {
    console.error('Setup intent error:', error)
    return NextResponse.json(
      { message: 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
