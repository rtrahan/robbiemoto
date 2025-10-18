import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.email!,
          name: user.email!.split('@')[0],
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

