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
  } catch (error: any) {
    console.error('❌ Product creation error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}

