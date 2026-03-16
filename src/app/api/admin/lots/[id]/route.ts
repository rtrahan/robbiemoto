import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUtcDates } from '@/lib/utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      title,
      description,
      condition,
      startingBidCents,
      reserveCents,
      mediaUrls,
    } = body
    
    try {
      const lot = await prisma.lot.update({
        where: { id },
        data: {
          title,
          description,
          condition,
          startingBidCents,
          reserveCents,
          ...(mediaUrls !== undefined && { mediaUrls }),
        },
      })
      
      return NextResponse.json(lot)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to update lot')

      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }

      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (condition !== undefined) updateData.condition = condition
      if (startingBidCents !== undefined) updateData.startingBidCents = startingBidCents
      if (reserveCents !== undefined) updateData.reserveCents = reserveCents
      if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls

      const { data: lot, error } = await supabaseServer
        .from('Lot')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase lot update error:', error)
        throw new Error(error.message)
      }

      return NextResponse.json(ensureUtcDates(lot))
    }
  } catch (error: any) {
    console.error('Error updating lot:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update lot' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    try {
      await prisma.lot.delete({
        where: { id },
      })
      
      return NextResponse.json({ success: true })
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to delete lot')

      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }

      const { error } = await supabaseServer
        .from('Lot')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase lot delete error:', error)
        throw new Error(error.message)
      }

      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    console.error('Error deleting lot:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete lot' },
      { status: 500 }
    )
  }
}
