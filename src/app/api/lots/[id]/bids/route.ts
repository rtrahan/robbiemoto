import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    try {
      const bids = await prisma.bid.findMany({
        where: { lotId: id },
        orderBy: { placedAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              alias: true,
              name: true,
            },
          },
        },
      })

      return NextResponse.json(bids)
    } catch (dbError) {
      console.log('Prisma failed, using Supabase for bid history')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return NextResponse.json([])
      }
      
      const { data: bids } = await supabaseServer
        .from('Bid')
        .select('*, user:User(alias, name)')
        .eq('lotId', id)
        .order('placedAt', { ascending: false })
        .limit(20)
      
      return NextResponse.json(bids || [])
    }
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}

