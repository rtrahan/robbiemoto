import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AuthHeader } from '@/components/auth-header'
import { formatCurrency } from '@/lib/helpers'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ category: string }>
}

const categoryMap: Record<string, string> = {
  'ceramics': 'CERAMICS',
  'leather': 'LEATHER',
  'accessories': 'ACCESSORIES',
  'other': 'OTHER',
}

const categoryNames: Record<string, string> = {
  'ceramics': 'Ceramics',
  'leather': 'Leather Goods',
  'accessories': 'Accessories',
  'other': 'Other',
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  
  if (!categoryMap[category]) {
    notFound()
  }
  
  const products = await getProducts(categoryMap[category])
  
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <a href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <img 
              src="/robbiemoto-horizontal.pdf" 
              alt="Robbiemoto" 
              className="h-[84px] w-auto"
            />
          </a>
          <AuthHeader />
        </div>
      </header>

      <main className="pt-16">
        {/* Category Header */}
        <div className="container px-4 py-12 md:px-8">
          <div className="mb-8">
            <Link href="/shop" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
              ← Back to Shop
            </Link>
            <h1 className="text-5xl font-serif font-light mb-4">{categoryNames[category]}</h1>
            <p className="text-gray-600">Handcrafted pieces for your collection</p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-4 relative">
                    {product.mediaUrls && Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0 ? (
                      <img 
                        src={String(product.mediaUrls[0])} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">
                        🏺
                      </div>
                    )}
                    
                    {product.status === 'SOLD_OUT' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold uppercase tracking-wider">Sold Out</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(product.priceCents)}
                    </span>
                    {product.compareAtCents && product.compareAtCents > product.priceCents && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.compareAtCents)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl opacity-10 mb-4">🏺</div>
              <p className="text-gray-500">No products in this category yet</p>
              <Link href="/shop" className="text-sm text-gray-600 hover:text-gray-900 mt-4 inline-block">
                Browse other categories →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

async function getProducts(category: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: category as any,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return products
  } catch (error) {
    console.error('Prisma failed, trying Supabase:', error)
    // Fallback to Supabase
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) return []
      
      const { data } = await supabaseServer
        .from('Product')
        .select('*')
        .eq('category', category)
        .eq('status', 'ACTIVE')
        .order('createdAt', { ascending: false })
      
      console.log(`Found ${data?.length || 0} products in category ${category}`)
      return data || []
    } catch (supabaseError) {
      console.error('Supabase also failed:', supabaseError)
      return []
    }
  }
}

