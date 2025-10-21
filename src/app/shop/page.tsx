import Link from 'next/link'
import { AuthHeader } from '@/components/auth-header'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/helpers'
import { Badge } from '@/components/ui/badge'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return products
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Fallback to Supabase
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      if (!supabaseServer) return []
      
      const { data } = await supabaseServer
        .from('Product')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('createdAt', { ascending: false })
      
      return data || []
    } catch {
      return []
    }
  }
}

export default async function ShopPage() {
  const products = await getProducts()
  
  const categories = [
    { name: 'Ceramics', slug: 'ceramics', emoji: '🏺', count: products.filter(p => p.category === 'CERAMICS').length },
    { name: 'Leather', slug: 'leather', emoji: '👜', count: products.filter(p => p.category === 'LEATHER').length },
    { name: 'Accessories', slug: 'accessories', emoji: '✨', count: products.filter(p => p.category === 'ACCESSORIES').length },
  ]

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
        {/* Hero Section */}
        <div className="container px-4 py-20 md:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-4">Shop</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of handcrafted ceramics, leather goods, and accessories
          </p>
        </div>

        {/* Categories Quick Links */}
        <div className="container px-4 pb-12 md:px-8">
          <div className="flex gap-4 justify-center flex-wrap max-w-3xl mx-auto">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-full border-2 border-gray-900 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              All Products ({products.length})
            </Link>
            {categories.filter(c => c.count > 0).map((category) => (
              <Link
                key={category.slug}
                href={`/shop/${category.slug}`}
                className="px-6 py-3 rounded-full border-2 border-gray-200 hover:border-gray-900 transition-colors font-medium"
              >
                {category.emoji} {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="container px-4 pb-20 md:px-8">
          {products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                    {product.mediaUrls && product.mediaUrls.length > 0 ? (
                      product.mediaUrls[0].includes('vid-') ? (
                        <video
                          src={product.mediaUrls[0]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={product.mediaUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                        🏺
                      </div>
                    )}
                    {product.compareAtCents && product.compareAtCents > product.priceCents && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(product.priceCents)}
                      </span>
                      {product.compareAtCents > 0 && product.compareAtCents > product.priceCents && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.compareAtCents)}
                        </span>
                      )}
                    </div>
                    {product.stockQuantity <= 0 && (
                      <Badge variant="outline" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-20">🏺</div>
              <h3 className="text-2xl font-serif font-light mb-2">No products yet</h3>
              <p className="text-gray-600">Check back soon for new items</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

