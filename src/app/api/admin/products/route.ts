import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      slug,
      category,
      priceCents,
      compareAtCents,
      stockQuantity,
      trackInventory,
      featured,
      status,
      mediaUrls,
    } = body

    try {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          slug,
          category,
          priceCents,
          compareAtCents: compareAtCents || null,
          mediaUrls: mediaUrls || [],
          stockQuantity,
          trackInventory,
          featured,
          status,
        },
      })

      return NextResponse.json(product)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to create product')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        throw new Error('No database available')
      }
      
      // Generate ID
      const generateId = () => {
        const timestamp = Date.now().toString(36)
        const randomStr = Math.random().toString(36).substring(2, 15)
        return `cm${timestamp}${randomStr}`.substring(0, 25)
      }
      
      const now = new Date().toISOString()
      
      const { data: product, error } = await supabaseServer
        .from('Product')
        .insert({
          id: generateId(),
          name,
          description,
          slug,
          category,
          priceCents,
          compareAtCents,
          mediaUrls: mediaUrls || [],
          stockQuantity,
          trackInventory,
          featured,
          status,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Supabase product creation error:', error)
        throw new Error(error.message)
      }
      
      return NextResponse.json(product)
    }
  } catch (error: any) {
    console.error('❌ Product creation error:', {
      message: error.message,
      code: error.code,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}

