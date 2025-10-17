import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'
import { z } from 'zod'

const auctionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  softCloseWindowSec: z.number().int().positive(),
  softCloseExtendSec: z.number().int().positive(),
  fixedIncrementCents: z.number().int().positive(),
  featured: z.boolean(),
  published: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const isAdmin = await isAdminAuthenticated()
    
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const data = auctionSchema.parse(body)
    
    // Create auction
    const auction = await prisma.auction.create({
      data: {
        ...data,
        status: 'DRAFT',
        visibility: 'open',
        incrementMode: 'fixed',
      },
    })
    
    return NextResponse.json(auction)
  } catch (error) {
    console.error('Create auction error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to create auction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true },
    })
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }
    
    const auctions = await prisma.auction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { lots: true },
        },
      },
    })
    
    return NextResponse.json(auctions)
  } catch (error) {
    console.error('Get auctions error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}
