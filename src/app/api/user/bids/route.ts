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
  } catch (error) {
    console.error('Error fetching user bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}

