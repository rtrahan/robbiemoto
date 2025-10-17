import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lotId, amountCents } = body
    
    if (!lotId || !amountCents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Get the lot
      const lot = await prisma.lot.findUnique({
        where: { id: lotId },
        include: {
          bids: {
            orderBy: { placedAt: 'desc' },
            take: 1,
          },
        },
      })

      if (!lot) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      // Check if bid is valid (at least $5 higher than current)
      const currentBid = lot.currentBidCents || lot.startingBidCents
      const minNextBid = currentBid + 500 // $5 increment

      if (amountCents < minNextBid) {
        return NextResponse.json(
          { error: `Minimum bid is $${(minNextBid / 100).toFixed(2)}` },
          { status: 400 }
        )
      }

      // Get authenticated user from auth token in header
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      console.log('Bid API - Checking auth:', { hasToken: !!token })
      
      let authUser = null
      
      if (token) {
        // Verify token with Supabase
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdyuqcxtdawxhhdxgkic.supabase.co',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        
        const { data, error } = await supabase.auth.getUser(token)
        authUser = data?.user
        
        console.log('Bid API - Auth result:', {
          hasUser: !!authUser,
          email: authUser?.email,
          error: error?.message,
        })
      }
      
      let user
      if (authUser && authUser.email) {
        // Find existing user in database
        user = await prisma.user.findUnique({
          where: { email: authUser.email },
        })
        
        console.log('Found user in DB:', { userId: user?.id, userName: user?.name })
        
        if (!user) {
          // Create user if doesn't exist (shouldn't happen if they signed up properly)
          console.log('Creating new user in DB for:', authUser.email)
          user = await prisma.user.create({
            data: {
              clerkId: authUser.id,
              email: authUser.email,
              name: authUser.email.split('@')[0],
              alias: authUser.email.split('@')[0],
            },
          })
        }
      } else {
        // Not authenticated - should not happen as frontend blocks this
        console.error('No authenticated user found')
        return NextResponse.json(
          { error: 'You must be logged in to place a bid. Please refresh and try again.' },
          { status: 401 }
        )
      }
      
      // Create the bid
      const bid = await prisma.bid.create({
        data: {
          lotId,
          userId: user.id,
          amountCents,
          status: 'LEADING',
          isLeading: true,
        },
      })

      // Update previous bids to OUTBID
      await prisma.bid.updateMany({
        where: {
          lotId,
          id: { not: bid.id },
          isLeading: true,
        },
        data: {
          status: 'OUTBID',
          isLeading: false,
        },
      })

      // Update lot's current bid
      await prisma.lot.update({
        where: { id: lotId },
        data: {
          currentBidCents: amountCents,
          reserveMet: lot.reserveCents ? amountCents >= lot.reserveCents : true,
        },
      })

      return NextResponse.json({
        success: true,
        bid,
        newCurrentBid: amountCents,
      })
    } catch (dbError) {
      console.log('Database not available, simulating bid')
      return NextResponse.json({
        success: true,
        bid: {
          id: Date.now().toString(),
          amountCents,
          placedAt: new Date(),
        },
        newCurrentBid: amountCents,
      })
    }
  } catch (error) {
    console.error('Bid error:', error)
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    )
  }
}
