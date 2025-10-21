'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams } from 'next/navigation'
import { AuthHeader } from '@/components/auth-header'
import { formatCurrency } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  
  useEffect(() => {
    fetchProduct()
  }, [slug])
  
  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        setProduct(null)
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }
  
  if (!product) {
    notFound()
  }
  
  const selectedMedia = product.mediaUrls?.[selectedMediaIndex]
  const isSelectedVideo = selectedMedia?.includes('vid-') || selectedMedia?.match(/\.(mp4|mov|webm|ogg)$/i)
  
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
            {/* Product Media Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 sticky top-24">
                {selectedMedia ? (
                  isSelectedVideo ? (
                    <video
                      key={selectedMedia}
                      src={selectedMedia}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img 
                      src={selectedMedia} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl opacity-10">
                    🏺
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.mediaUrls && product.mediaUrls.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.mediaUrls.map((url: string, index: number) => {
                    const isVideo = url.includes('vid-') || url.match(/\.(mp4|mov|webm|ogg)$/i)
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedMediaIndex(index)}
                        className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-all ${
                          index === selectedMediaIndex ? 'border-gray-900' : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            ▶️
                          </div>
                        ) : (
                          <img 
                            src={url} 
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-serif font-light mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(product.priceCents)}
                  </span>
                  {product.compareAtCents > 0 && product.compareAtCents > product.priceCents && (
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


