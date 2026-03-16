import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function computeAuctionStatus(startsAt: string, endsAt: string): string {
  const now = new Date()
  const start = new Date(startsAt)
  const end = new Date(endsAt)

  if (now >= start && now < end) return 'LIVE'
  if (now >= end) return 'ENDED'
  return 'DRAFT'
}

function generateId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `cm${timestamp}${randomStr}`.substring(0, 25)
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name, slug, description, startsAt, endsAt,
      softCloseWindowSec, softCloseExtendSec, fixedIncrementCents,
      featured, published,
    } = body

    if (!name || !slug || !startsAt || !endsAt) {
      return NextResponse.json(
        { message: 'Name, slug, start date, and end date are required' },
        { status: 400 }
      )
    }

    const status = computeAuctionStatus(startsAt, endsAt)

    const auctionData = {
      name,
      slug,
      description: description || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      softCloseWindowSec: softCloseWindowSec ?? 120,
      softCloseExtendSec: softCloseExtendSec ?? 120,
      fixedIncrementCents: fixedIncrementCents ?? 500,
      featured: featured ?? false,
      published: published ?? false,
      status,
      visibility: 'open',
      incrementMode: 'fixed',
    }

    try {
      const auction = await prisma.auction.create({ data: auctionData })

      revalidatePath('/admin/auctions')
      revalidatePath('/auctions')
      revalidatePath('/')

      return NextResponse.json(auction)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to create auction')

      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }

      const now = new Date().toISOString()

      const { data: auction, error } = await supabaseServer
        .from('Auction')
        .insert({
          id: generateId(),
          ...auctionData,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase auction creation error:', error)
        throw new Error(error.message)
      }

      revalidatePath('/admin/auctions')
      revalidatePath('/auctions')
      revalidatePath('/')

      return NextResponse.json(auction)
    }
  } catch (error: any) {
    console.error('Create auction error:', {
      message: error?.message,
      code: error?.code,
    })
    return NextResponse.json(
      { message: error?.message || 'Failed to create auction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
      const auctions = await prisma.auction.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { lots: true },
          },
        },
      })

      return NextResponse.json(auctions)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase for auctions list')

      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }

      const { data: auctions, error } = await supabaseServer
        .from('Auction')
        .select('*, Lot(id)')
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase auctions list error:', error)
        throw new Error(error.message)
      }

      const formatted = (auctions || []).map((a: any) => ({
        ...a,
        _count: { lots: a.Lot?.length ?? 0 },
        Lot: undefined,
      }))

      return NextResponse.json(formatted)
    }
  } catch (error: any) {
    console.error('Get auctions error:', error)
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}
