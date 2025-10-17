import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Admin endpoint - shows ALL lots including unpublished
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    try {
      const lots = await prisma.lot.findMany({
        where: {
          auctionId: id,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { bids: true },
          },
        },
      })
      
      return NextResponse.json(lots)
    } catch (dbError) {
      console.log('Database not available')
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching lots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    )
  }
}

