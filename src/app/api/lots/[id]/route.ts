import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUtcDates } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    try {
      const lot = await prisma.lot.findUnique({
        where: { id },
        include: {
          _count: { select: { bids: true } },
          auction: {
            select: {
              id: true,
              slug: true,
              name: true,
              endsAt: true,
              softCloseWindowSec: true,
              softCloseExtendSec: true,
            },
          },
        },
      })

      if (!lot) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      // Compute staggered end time
      const allLots = await prisma.lot.findMany({
        where: { auctionId: lot.auction.id, published: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
      const itemIndex = allLots.findIndex(l => l.id === id)

      const { getStaggeredEndTime, calculateItemEndTime } = await import('@/lib/soft-close')
      const baseEndTime = getStaggeredEndTime(lot.auction.endsAt, Math.max(itemIndex, 0))
      const effectiveEnd = calculateItemEndTime(
        baseEndTime,
        lot.lastBidAt,
        lot.auction.softCloseWindowSec,
        lot.auction.softCloseExtendSec
      )

      return NextResponse.json({
        ...lot,
        itemIndex: Math.max(itemIndex, 0),
        baseEndTime: baseEndTime.toISOString(),
        effectiveEndTime: effectiveEnd.toISOString(),
        isExtended: effectiveEnd > baseEndTime,
      })
    } catch (prismaError) {
      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
      }

      const { data: lot } = await supabaseServer
        .from('Lot')
        .select('*')
        .eq('id', id)
        .single()

      if (!lot) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      const { data: auction } = await supabaseServer
        .from('Auction')
        .select('id, slug, name, endsAt, softCloseWindowSec, softCloseExtendSec')
        .eq('id', lot.auctionId)
        .single()

      const { count } = await supabaseServer
        .from('Bid')
        .select('*', { count: 'exact', head: true })
        .eq('lotId', id)

      const { data: allLots } = await supabaseServer
        .from('Lot')
        .select('id')
        .eq('auctionId', lot.auctionId)
        .eq('published', true)
        .order('sortOrder', { ascending: true })
        .order('createdAt', { ascending: true })

      const itemIndex = allLots?.findIndex((l: any) => l.id === id) ?? 0
      const endsAtStr = auction?.endsAt ? (auction.endsAt.endsWith('Z') ? auction.endsAt : auction.endsAt + 'Z') : new Date().toISOString()
      const lastBidStr = lot.lastBidAt ? (lot.lastBidAt.endsWith('Z') ? lot.lastBidAt : lot.lastBidAt + 'Z') : null

      const { getStaggeredEndTime, calculateItemEndTime } = await import('@/lib/soft-close')
      const baseEndTime = getStaggeredEndTime(endsAtStr, Math.max(itemIndex, 0))
      const effectiveEnd = calculateItemEndTime(baseEndTime, lastBidStr, auction?.softCloseWindowSec ?? 120, auction?.softCloseExtendSec ?? 120)

      return NextResponse.json(ensureUtcDates({
        ...lot,
        auction: auction ? ensureUtcDates(auction) : null,
        _count: { bids: count || 0 },
        itemIndex: Math.max(itemIndex, 0),
        baseEndTime: baseEndTime.toISOString(),
        effectiveEndTime: effectiveEnd.toISOString(),
        isExtended: effectiveEnd > baseEndTime,
      }))
    }
  } catch (error) {
    console.error('Error fetching lot:', error)
    return NextResponse.json({ error: 'Failed to fetch lot' }, { status: 500 })
  }
}
