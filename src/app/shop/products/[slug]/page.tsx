import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AuthHeader } from '@/components/auth-header'
import { formatCurrency } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  
  const product = await getProduct(slug)
  
  if (!product) {
    notFound()
  }
  
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
        <div className="container px-4 py-12 md:px-8 max-w-6xl mx-auto">
          <Link href="/shop" className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block">
            ← Back to Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden sticky top-24">
                {product.mediaUrls && Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0 ? (
                  <img 
                    src={product.mediaUrls[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl opacity-10">
                    🏺
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-serif font-light mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(product.priceCents)}
                  </span>
                  {product.compareAtCents && product.compareAtCents > product.priceCents && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(product.compareAtCents)}
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="prose prose-gray">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Purchase Section */}
              {product.status === 'ACTIVE' ? (
                <div className="space-y-4 pt-6 border-t">
                  {product.trackInventory && (
                    <p className="text-sm text-gray-600">
                      {product.stockQuantity > 0 ? (
                        <span>{product.stockQuantity} in stock</span>
                      ) : (
                        <span className="text-red-600 font-medium">Out of stock</span>
                      )}
                    </p>
                  )}
                  
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto px-12"
                    disabled={product.trackInventory && product.stockQuantity === 0}
                  >
                    {product.trackInventory && product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Free shipping on orders over $100
                  </p>
                </div>
              ) : (
                <div className="pt-6 border-t">
                  <p className="text-lg font-medium text-gray-500">Currently unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    })
    
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

