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
    
    // Get authenticated user from auth token in header (declare here for scope)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('Bid API - Checking auth:', { hasToken: !!token })
    
    let authUser: any = null
    
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
    
    if (!authUser || !authUser.email) {
      console.error('No authenticated user found')
      return NextResponse.json(
        { error: 'You must be logged in to place a bid. Please refresh and try again.' },
        { status: 401 }
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
      
      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: { email: authUser.email },
      })
      
      console.log('Found user in DB:', { userId: user?.id, userName: user?.name })
      
      if (!user) {
        // Create user if doesn't exist
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
      console.log('Prisma failed, using Supabase for bid')
      
      // Fallback to Supabase
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer || !authUser?.email) {
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 503 }
        )
      }
      
      // Find user in Supabase
      let { data: supaUser, error: userError } = await supabaseServer
        .from('User')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle()
      
      if (!supaUser && !userError) {
        // Try to create user
        console.log('Creating user in Supabase for:', authUser.email)
        const { data: newUser, error: createError } = await supabaseServer
          .from('User')
          .insert({
            clerkId: authUser.id,
            email: authUser.email,
            name: authUser.email.split('@')[0],
            alias: authUser.email.split('@')[0],
          })
          .select()
          .maybeSingle()
        
        if (createError) {
          console.error('User creation error - Full details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
          })
          
          // If user already exists (race condition), try to fetch again
          if (createError.code === '23505') { // Unique violation
            const { data: existingUser } = await supabaseServer
              .from('User')
              .select('*')
              .eq('email', authUser.email)
              .single()
            
            supaUser = existingUser
          } else {
            // Return detailed error for debugging
            return NextResponse.json(
              { 
                error: 'Database error. RLS might be blocking. Check Vercel logs.',
                details: createError.message 
              },
              { status: 500 }
            )
          }
        } else {
          supaUser = newUser
        }
      }
      
      if (!supaUser) {
        console.error('Could not find or create user')
        return NextResponse.json(
          { error: 'User not found. Please sign up first.' },
          { status: 404 }
        )
      }
      
      // Create bid using Supabase
      const { data: bid, error: bidError } = await supabaseServer
        .from('Bid')
        .insert({
          lotId,
          userId: supaUser.id,
          amountCents,
          status: 'LEADING',
          isLeading: true,
        })
        .select()
        .single()
      
      if (bidError) {
        console.error('Supabase bid error:', bidError)
        return NextResponse.json(
          { error: 'Failed to place bid' },
          { status: 500 }
        )
      }
      
      // Update previous bids to OUTBID
      await supabaseServer
        .from('Bid')
        .update({ status: 'OUTBID', isLeading: false })
        .eq('lotId', lotId)
        .neq('id', bid.id)
        .eq('isLeading', true)
      
      // Get lot to check reserve
      const { data: lotData } = await supabaseServer
        .from('Lot')
        .select('reserveCents')
        .eq('id', lotId)
        .single()
      
      // Update lot's current bid
      await supabaseServer
        .from('Lot')
        .update({
          currentBidCents: amountCents,
          reserveMet: lotData?.reserveCents ? amountCents >= lotData.reserveCents : true,
        })
        .eq('id', lotId)
      
      return NextResponse.json({
        success: true,
        bid,
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
