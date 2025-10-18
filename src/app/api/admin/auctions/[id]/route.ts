import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single auction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    try {
      const auction = await prisma.auction.findUnique({
        where: { id },
        include: {
          lots: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { lots: true },
          },
        },
      })
      
      if (!auction) {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(auction)
    } catch (dbError) {
      console.log('Prisma failed, using Supabase for auction detail')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 503 }
        )
      }
      
      const { data: auction } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*)')
        .eq('id', id)
        .single()
      
      if (!auction) {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        )
      }
      
      // Format to match Prisma structure
      const formattedAuction = {
        ...auction,
        lots: (auction.lots || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
        _count: { lots: auction.lots?.length || 0 },
      }
      
      return NextResponse.json(formattedAuction)
    }
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    )
  }
}

function getMockAuctionById(id: string) {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const mockAuctions: any = {
    '1': {
      id: '1',
      slug: 'spring-awakening-2025',
      name: 'Spring Awakening 2025',
      description: 'Fresh spring colors meet organic forms',
      status: 'PREVIEW',
      startsAt: futureDate,
      endsAt: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      softCloseWindowSec: 120,
      softCloseExtendSec: 120,
      fixedIncrementCents: 500,
      featured: true,
      published: true,
      createdAt: now,
      updatedAt: now,
      lots: [],
      _count: { lots: 6 },
    },
  }
  
  return mockAuctions[id] || null
}

// PATCH - Update auction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      name,
      description,
      startsAt,
      endsAt,
      softCloseWindowSec,
      softCloseExtendSec,
      fixedIncrementCents,
      featured,
      published,
    } = body
    
    console.log('Updating auction with dates:', { startsAt, endsAt, published })
    
    try {
      // Parse datetime-local strings to proper Date objects
      // datetime-local format: "2025-10-17T23:20" (no timezone, browser's local time)
      const startsAtDate = new Date(startsAt)
      const endsAtDate = new Date(endsAt)
      
      console.log('Parsed dates:', {
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString()
      })
      
      const auction = await prisma.auction.update({
        where: { id },
        data: {
          name,
          description,
          startsAt: startsAtDate,
          endsAt: endsAtDate,
          softCloseWindowSec,
          softCloseExtendSec,
          fixedIncrementCents,
          featured,
          published,
        },
      })
      
      // Revalidate homepage cache immediately
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/')
      revalidatePath('/admin')
      revalidatePath('/admin/auctions')
      
      console.log('✅ Auction updated and cache revalidated')
      
      return NextResponse.json(auction)
    } catch (dbError) {
      console.log('Prisma failed, using Supabase to update auction')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 503 }
        )
      }
      
      const { data: auction, error } = await supabaseServer
        .from('Auction')
        .update({
          name,
          description,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          softCloseWindowSec,
          softCloseExtendSec,
          fixedIncrementCents,
          featured,
          published,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json(
          { error: 'Failed to update auction' },
          { status: 500 }
        )
      }
      
      // Revalidate homepage cache immediately
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/')
      revalidatePath('/admin')
      revalidatePath('/admin/auctions')
      
      console.log('✅ Auction updated via Supabase and cache revalidated:', id)
      return NextResponse.json(auction)
    }
  } catch (error) {
    console.error('Error updating auction:', error)
    return NextResponse.json(
      { error: 'Failed to update auction' },
      { status: 500 }
    )
  }
}

// DELETE - Delete auction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    try {
      // Delete auction (cascade will delete lots and bids)
      await prisma.auction.delete({
        where: { id },
      })
      
      console.log('✅ Auction deleted via Prisma:', id)
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.log('Prisma failed, using Supabase to delete auction')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 503 }
        )
      }
      
      // Delete associated bids first (get lot IDs)
      const { data: lots } = await supabaseServer
        .from('Lot')
        .select('id')
        .eq('auctionId', id)
      
      if (lots && lots.length > 0) {
        const lotIds = lots.map(l => l.id)
        
        // Delete all bids for these lots
        await supabaseServer
          .from('Bid')
          .delete()
          .in('lotId', lotIds)
        
        // Delete all lots
        await supabaseServer
          .from('Lot')
          .delete()
          .eq('auctionId', id)
      }
      
      // Finally delete auction
      const { error } = await supabaseServer
        .from('Auction')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Supabase delete error:', error)
        return NextResponse.json(
          { error: 'Failed to delete auction' },
          { status: 500 }
        )
      }
      
      console.log('✅ Auction deleted via Supabase:', id)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting auction:', error)
    return NextResponse.json(
      { error: 'Failed to delete auction' },
      { status: 500 }
    )
  }
}

