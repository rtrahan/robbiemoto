import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuctionStatus } from '@/lib/auction-helpers'

export async function GET() {
  try {
    // Try Prisma first
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
      
      const pastAuctions = auctions
        .filter(auction => getAuctionStatus(auction) === 'ENDED')
        .map(auction => ({
          ...auction,
          totalSales: auction.lots.reduce((sum, lot) => 
            sum + (lot.currentBidCents || 0), 0
          ),
          itemsSold: auction.lots.filter(lot => lot.currentBidCents && lot.currentBidCents > 0).length,
        }))
      
      return NextResponse.json(pastAuctions)
    } catch (prismaError) {
      // Fallback to Supabase (silent)
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json([])
      }
      
      const { data: auctions } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*)')
        .eq('published', true)
        .order('endsAt', { ascending: false })
      
      if (!auctions) {
        return NextResponse.json([])
      }
      
      const pastAuctions = auctions
        .filter(auction => getAuctionStatus(auction) === 'ENDED')
        .map((auction: any) => ({
          ...auction,
          _count: { lots: auction.lots?.length || 0 },
          totalSales: auction.lots?.reduce((sum: number, lot: any) => 
            sum + (lot.currentBidCents || 0), 0) || 0,
          itemsSold: auction.lots?.filter((lot: any) => lot.currentBidCents && lot.currentBidCents > 0).length || 0,
        }))
      
      return NextResponse.json(pastAuctions)
    }
  } catch (error) {
    console.error('Error fetching past auctions:', error)
    return NextResponse.json([])
  }
}

