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
      console.log('Prisma failed, using Supabase for admin lots')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json([])
      }
      
      const { data: lots } = await supabaseServer
        .from('Lot')
        .select('*, _count:Bid(count)')
        .eq('auctionId', id)
        .order('sortOrder', { ascending: true })
      
      return NextResponse.json(lots || [])
    }
  } catch (error) {
    console.error('Error fetching lots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    )
  }
}

