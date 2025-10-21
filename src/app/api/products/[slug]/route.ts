import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
      })
      
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json(product)
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase')
      
      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) {
        throw new Error('No database available')
      }
      
      const { data: product, error } = await supabaseServer
        .from('Product')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error || !product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json(product)
    }
  } catch (error: any) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

