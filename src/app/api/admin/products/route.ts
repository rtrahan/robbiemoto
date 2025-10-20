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
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        slug,
        category,
        priceCents,
        compareAtCents: compareAtCents || null,
        stockQuantity,
        trackInventory,
        featured,
        status,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

