import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if we have a valid database connection
    const isDemoMode = !process.env.DATABASE_URL || 
                       process.env.DATABASE_URL.includes('username:password')
    
    if (isDemoMode) {
      // Return mock data for demo mode
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
      
      return NextResponse.json({
        id: 'demo-auction',
        name: 'Next Drop',
        startsAt: futureDate.toISOString(),
        endsAt: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days after start
        status: 'SCHEDULED'
      })
    }
    
    const now = new Date()
    
    // Find the next upcoming auction or the currently live auction
    const nextAuction = await prisma.auction.findFirst({
      where: {
        published: true,
        OR: [
          {
            // Currently live
            startsAt: { lte: now },
            endsAt: { gte: now },
          },
          {
            // Upcoming
            startsAt: { gt: now },
          },
        ],
      },
      orderBy: {
        startsAt: 'asc',
      },
      select: {
        id: true,
        name: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
    })
    
    if (!nextAuction) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(nextAuction)
  } catch (error) {
    console.error('Failed to fetch next auction:', error)
    // Return mock data on error
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    
    return NextResponse.json({
      id: 'demo-auction',
      name: 'Next Drop',
      startsAt: futureDate.toISOString(),
      endsAt: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SCHEDULED'
    })
  }
}
