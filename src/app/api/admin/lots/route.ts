import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUtcDates } from '@/lib/utils'

function generateId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `cm${timestamp}${randomStr}`.substring(0, 25)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      auctionId,
      title,
      slug,
      description,
      condition,
      startingBidCents,
      reserveCents,
      mediaUrls,
    } = body

    if (!auctionId || !title) {
      return NextResponse.json(
        { error: 'auctionId and title are required' },
        { status: 400 }
      )
    }

    const lotSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

    try {
      const lot = await prisma.lot.create({
        data: {
          auctionId,
          title,
          slug: lotSlug,
          description,
          condition,
          startingBidCents,
          reserveCents,
          mediaUrls: mediaUrls || [],
          published: true,
        },
      })
      
      return NextResponse.json(lot)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to create lot')

      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }

      const now = new Date().toISOString()

      const { data: lot, error } = await supabaseServer
        .from('Lot')
        .insert({
          id: generateId(),
          auctionId,
          title,
          slug: lotSlug,
          description: description || null,
          condition: condition || null,
          startingBidCents,
          reserveCents: reserveCents || null,
          mediaUrls: mediaUrls || [],
          published: true,
          sold: false,
          reserveMet: false,
          sortOrder: 0,
          featured: false,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase lot creation error:', error)
        throw new Error(error.message)
      }

      return NextResponse.json(ensureUtcDates(lot))
    }
  } catch (error: any) {
    console.error('Error creating lot:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create lot' },
      { status: 500 }
    )
  }
}
