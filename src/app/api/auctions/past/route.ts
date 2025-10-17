import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuctionStatus } from '@/lib/auction-helpers'

export async function GET() {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        published: true,
      },
      orderBy: { endsAt: 'desc' },
      include: {
        _count: { select: { lots: true } },
        lots: {
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            mediaUrls: true,
            currentBidCents: true,
            sold: true,
          },
        },
      },
    })
    
    // Filter to only ended auctions and calculate stats
    const pastAuctions = auctions
      .filter(auction => getAuctionStatus(auction) === 'ENDED')
      .map(auction => ({
        ...auction,
        totalSales: auction.lots.reduce((sum, lot) => 
          sum + (lot.sold ? (lot.currentBidCents || 0) : 0), 0
        ),
        itemsSold: auction.lots.filter(lot => lot.sold).length,
      }))
    
    return NextResponse.json(pastAuctions)
  } catch (error) {
    console.error('Error fetching past auctions:', error)
    return NextResponse.json([])
  }
}

