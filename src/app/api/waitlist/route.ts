import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { isValidEmail, generateVerificationCode } from '@/lib/helpers'
import { z } from 'zod'

const waitlistSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  optInSms: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phoneNumber, optInSms } = waitlistSchema.parse(body)
    
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    // Check if we're in demo mode
    const isDemoMode = !process.env.DATABASE_URL || 
                       process.env.DATABASE_URL.includes('username:password')
    
    if (isDemoMode) {
      // In demo mode, just return success without database operations
      console.log(`[Demo Mode] Waitlist signup: ${email}`)
      return NextResponse.json({
        message: 'Successfully joined the waitlist! (Demo mode - no email sent)',
      })
    }
    
    // Check if email already exists
    const existing = await prisma.signup.findUnique({
      where: { email },
    })
    
    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json(
          { message: 'You are already on the waitlist!' },
          { status: 400 }
        )
      }
      
      // Resend confirmation email
      await sendConfirmationEmail(email)
      
      return NextResponse.json({
        message: 'Confirmation email resent. Please check your inbox.',
      })
    }
    
    // Create new signup
    await prisma.signup.create({
      data: {
        email,
        phoneNumber,
        optInSms: optInSms || false,
      },
    })
    
    // Send confirmation email
    await sendConfirmationEmail(email)
    
    return NextResponse.json({
      message: 'Successfully joined the waitlist! Check your email to confirm.',
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail(email: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?email=${encodeURIComponent(email)}`
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Confirm your Robbiemoto waitlist subscription',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Robbiemoto!</h1>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining our waitlist. Click the link below to confirm your email address
            and be the first to know about our upcoming auctions.
          </p>
          <div style="margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirm Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If you didn't sign up for Robbiemoto, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Robbiemoto | Handcrafted mugs and leather goods
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    throw error
  }
}
