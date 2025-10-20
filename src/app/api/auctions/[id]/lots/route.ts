import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          published: true,
        },
        orderBy: [
          { featured: 'desc' },
          { sortOrder: 'asc' },
        ],
        include: {
          _count: {
            select: { bids: true },
          },
          auction: {
            select: {
              endsAt: true,
              softCloseWindowSec: true,
              softCloseExtendSec: true,
            },
          },
        },
      })
      
      // Calculate soft close end times for each lot
      const { calculateItemEndTime } = await import('@/lib/soft-close')
      const lotsWithSoftClose = lots.map(lot => {
        const itemEndTime = calculateItemEndTime(
          lot.auction.endsAt,
          lot.lastBidAt,
          lot.auction.softCloseWindowSec,
          lot.auction.softCloseExtendSec
        )
        
        return {
          ...lot,
          effectiveEndTime: itemEndTime.toISOString(),
          isExtended: itemEndTime > lot.auction.endsAt,
        }
      })
      
      return NextResponse.json(lotsWithSoftClose)
    } catch (dbError) {
      // Fallback to Supabase (silent - don't spam logs)
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json([])
      }
      
      const { data: lots } = await supabaseServer
        .from('Lot')
        .select('*')
        .eq('auctionId', id)
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('sortOrder', { ascending: true })
      
      if (!lots) {
        return NextResponse.json([])
      }
      
      // Manually fetch bid counts for each lot
      const lotsWithCounts = await Promise.all(
        lots.map(async (lot: any) => {
          const { count } = await supabaseServer
            .from('Bid')
            .select('*', { count: 'exact', head: true })
            .eq('lotId', lot.id)
          
          return {
            ...lot,
            _count: { bids: count || 0 },
          }
        })
      )
      
      return NextResponse.json(lotsWithCounts)
    }
  } catch (error) {
    console.error('Error fetching lots:', error)
    return NextResponse.json([])
  }
}

function getMockLots() {
  const now = new Date()
  
  return [
    {
      id: '1',
      title: 'Sage Green Mug',
      description: 'Earthy sage green with smooth matte finish',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: 8500,
      reserveCents: 8000,
      reserveMet: true,
      featured: true,
      _count: { bids: 5 },
    },
    {
      id: '2',
      title: 'Cobalt Blue Espresso Cup',
      description: 'Rich cobalt blue glaze, perfect for morning espresso',
      condition: 'New - Handmade',
      startingBidCents: 3000,
      currentBidCents: null,
      reserveCents: 7000,
      reserveMet: false,
      featured: true,
      _count: { bids: 0 },
    },
    {
      id: '3',
      title: 'Charcoal Grey Coffee Mug',
      description: 'Modern charcoal with speckled texture',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: 12000,
      reserveCents: 9000,
      reserveMet: true,
      featured: false,
      _count: { bids: 8 },
    },
    {
      id: '4',
      title: 'Cream & Gold Latte Mug',
      description: 'Soft cream with subtle gold accents',
      condition: 'New - Handmade',
      startingBidCents: 4000,
      currentBidCents: 9500,
      reserveCents: 10000,
      reserveMet: false,
      featured: false,
      _count: { bids: 3 },
    },
    {
      id: '5',
      title: 'Forest Green Tea Cup',
      description: 'Deep forest green, holds 8oz perfectly',
      condition: 'New - Handmade',
      startingBidCents: 3000,
      currentBidCents: 7500,
      reserveCents: 7000,
      reserveMet: true,
      featured: false,
      _count: { bids: 6 },
    },
    {
      id: '6',
      title: 'Sunset Orange Mug',
      description: 'Warm orange gradient reminiscent of sunset',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: null,
      reserveCents: 8500,
      reserveMet: false,
      featured: false,
      _count: { bids: 0 },
    },
    {
      id: '7',
      title: 'Midnight Black Mug',
      description: 'Matte black with glossy interior',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: 15000,
      reserveCents: 10000,
      reserveMet: true,
      featured: false,
      _count: { bids: 12 },
    },
    {
      id: '8',
      title: 'Ocean Blue Latte Bowl',
      description: 'Wide bowl-style mug in ocean blue',
      condition: 'New - Handmade',
      startingBidCents: 4000,
      currentBidCents: 11000,
      reserveCents: 10000,
      reserveMet: true,
      featured: false,
      _count: { bids: 7 },
    },
    {
      id: '9',
      title: 'Terracotta Espresso Cup',
      description: 'Natural terracotta with clear glaze',
      condition: 'New - Handmade',
      startingBidCents: 2500,
      currentBidCents: 6000,
      reserveCents: 6000,
      reserveMet: true,
      featured: false,
      _count: { bids: 4 },
    },
    {
      id: '10',
      title: 'Pearl White Mug',
      description: 'Elegant pearl white with subtle shimmer',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: null,
      reserveCents: 8000,
      reserveMet: false,
      featured: false,
      _count: { bids: 0 },
    },
    {
      id: '11',
      title: 'Rust & Cream Mug',
      description: 'Two-tone glaze, rust exterior with cream interior',
      condition: 'New - Handmade',
      startingBidCents: 4500,
      currentBidCents: 10500,
      reserveCents: 11000,
      reserveMet: false,
      featured: false,
      _count: { bids: 5 },
    },
    {
      id: '12',
      title: 'Dusty Rose Mug',
      description: 'Soft dusty rose, perfect for morning tea',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      currentBidCents: 13500,
      reserveCents: 9000,
      reserveMet: true,
      featured: false,
      _count: { bids: 9 },
    },
  ]
}

