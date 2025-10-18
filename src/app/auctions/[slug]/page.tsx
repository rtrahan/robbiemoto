import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/helpers'
import { getAuctionStatus } from '@/lib/auction-helpers'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Package } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PastAuctionPage({ params }: PageProps) {
  const { slug } = await params
  
  const auction = await getAuctionBySlug(slug)
  
  if (!auction) {
    notFound()
  }
  
  const status = getAuctionStatus(auction)
  const totalSold = auction.lots.filter((l: any) => l.sold).length
  const totalSales = auction.lots.reduce((sum: number, l: any) => 
    sum + (l.sold ? (l.currentBidCents || 0) : 0), 0
  )
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container px-4 py-4 md:px-8">
          <div className="flex items-center justify-between mb-3">
            <a href="/" className="flex items-center hover:opacity-70 transition-opacity">
              <img 
                src="/robbiemoto-horizontal.pdf" 
                alt="Robbiemoto" 
                className="h-12 w-auto"
              />
            </a>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif font-light">{auction.name}</h1>
                <Badge variant={status === 'ENDED' ? 'outline' : 'default'}>
                  {status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">{auction.description}</p>
              <div className="flex gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(auction.startsAt)} → {formatDateTime(auction.endsAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {auction.lots.length} items
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      {status === 'ENDED' && (
        <div className="border-b border-gray-200 bg-gray-50 py-6">
          <div className="container px-4 md:px-8">
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Items Sold</p>
                <p className="text-2xl font-bold">{totalSold} / {auction.lots.length}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Average Sale</p>
                <p className="text-2xl font-bold">
                  {totalSold > 0 ? formatCurrency(Math.round(totalSales / totalSold)) : '$0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="container px-4 py-12 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">
            All Items from This Auction
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {auction.lots.map((lot: any) => (
              <Card key={lot.id} className="overflow-hidden">
                {/* Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  {lot.mediaUrls && Array.isArray(lot.mediaUrls) && lot.mediaUrls.length > 0 ? (
                    <img 
                      src={(lot.mediaUrls as string[])[0]} 
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-6xl opacity-20">🏺</div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {lot.sold ? (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
                      ✓ Sold
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
                      Not Sold
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-light text-gray-900 mb-1 line-clamp-2">
                      {lot.title}
                    </h3>
                    {lot.condition && (
                      <p className="text-xs text-gray-500">{lot.condition}</p>
                    )}
                  </div>

                  {lot.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {lot.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Starting Bid</span>
                      <span className="font-medium">{formatCurrency(lot.startingBidCents)}</span>
                    </div>
                    
                    {lot.sold && lot.currentBidCents && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Sold For</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(lot.currentBidCents)}
                        </span>
                      </div>
                    )}
                    
                    {!lot.sold && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-400">Did not meet reserve</p>
                      </div>
                    )}
                    
                    {lot._count?.bids > 0 && (
                      <div className="text-xs text-gray-400 text-center pt-2 border-t">
                        {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'} placed
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

async function getAuctionBySlug(slug: string) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { slug },
      include: {
        lots: {
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { bids: true } },
          },
        },
      },
    })
    
    return auction
  } catch (error) {
    console.log('Prisma error, trying Supabase for auction')
    
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return null
      }
      
      const { data: auction } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*)')
        .eq('slug', slug)
        .single()
      
      if (!auction) {
        return null
      }
      
      // Filter to published lots and add bid counts
      return {
        ...auction,
        lots: (auction.lots || [])
          .filter((lot: any) => lot.published)
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
          .map((lot: any) => ({
            ...lot,
            _count: { bids: 0 }, // TODO: Could query bids separately if needed
          })),
      }
    } catch (supabaseError) {
      console.error('All database connections failed:', supabaseError)
      return null
    }
  }
}

