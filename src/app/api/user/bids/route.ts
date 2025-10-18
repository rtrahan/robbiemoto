import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Get auth token from header (declare at function scope)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  let authUser: any = null
  
  if (token) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdyuqcxtdawxhhdxgkic.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    const { data } = await supabase.auth.getUser(token)
    authUser = data?.user
  }
  
  if (!authUser || !authUser.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: authUser.id,
          email: authUser.email,
          name: authUser.email.split('@')[0],
          alias: 'bidder_' + Math.floor(Math.random() * 1000),
        },
      })
    }

    // Get user's bids with lot information
    const bids = await prisma.bid.findMany({
      where: { userId: dbUser.id },
      orderBy: { placedAt: 'desc' },
      include: {
        lot: {
          select: {
            id: true,
            title: true,
            slug: true,
            mediaUrls: true,
            auction: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(bids)
  } catch (prismaError) {
    console.log('Prisma failed, using Supabase for user bids')
    
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer || !authUser?.email) {
        return NextResponse.json([], { status: 200 })
      }
      
      // Get user
      const { data: user } = await supabaseServer
        .from('User')
        .select('id')
        .eq('email', authUser.email)
        .single()
      
      if (!user) {
        return NextResponse.json([], { status: 200 })
      }
      
      // Get bids
      const { data: bids } = await supabaseServer
        .from('Bid')
        .select('*, lot:Lot(id, title, slug, mediaUrls, auction:Auction(name, slug))')
        .eq('userId', user.id)
        .order('placedAt', { ascending: false })
      
      return NextResponse.json(bids || [])
    } catch (supabaseError) {
      console.error('Error fetching user bids:', supabaseError)
      return NextResponse.json([], { status: 200 })
    }
  }
}
