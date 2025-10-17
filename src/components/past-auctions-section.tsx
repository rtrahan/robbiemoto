'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/helpers'
import { ChevronRight } from 'lucide-react'

export function PastAuctionsSection() {
  const [pastAuctions, setPastAuctions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchPastAuctions = async () => {
      try {
        const response = await fetch('/api/auctions/past')
        if (response.ok) {
          const data = await response.json()
          setPastAuctions(data)
        }
      } catch (error) {
        console.error('Failed to fetch past auctions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPastAuctions()
  }, [])

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (pastAuctions.length === 0) {
    return null
  }

  const displayedAuctions = showAll ? pastAuctions : pastAuctions.slice(0, 3)

  return (
    <div className="border-t border-gray-200 bg-gray-50 py-16">
      <div className="container px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-light text-gray-900 mb-2">
            Past Auctions
          </h2>
          <p className="text-sm text-gray-600">
            Browse previous drops and see what sold
          </p>
        </div>

        <div className="space-y-6">
          {displayedAuctions.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Auction Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-xl font-light">{auction.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded uppercase font-medium">
                        Ended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{auction.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(auction.startsAt)} → {formatDateTime(auction.endsAt)}
                    </p>
                  </div>
                </div>

                {/* Items Grid */}
                {auction.lots && auction.lots.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {auction.lots.slice(0, 12).map((lot: any) => (
                      <div key={lot.id} className="group">
                        <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2 relative">
                          {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
                            <img 
                              src={lot.mediaUrls[0]} 
                              alt={lot.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div className="text-3xl opacity-10">🏺</div>
                            </div>
                          )}
                          
                          {/* Sold Badge */}
                          {lot.sold && lot.currentBidCents && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-xs text-white font-medium text-center">
                                Sold: {formatCurrency(lot.currentBidCents)}
                              </p>
                            </div>
                          )}
                          
                          {/* Unsold Badge */}
                          {!lot.sold && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800/80 to-transparent p-2">
                              <p className="text-xs text-gray-300 font-medium text-center">
                                Not sold
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2 leading-tight">
                          {lot.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-6 mt-4 pt-4 border-t text-sm text-gray-600">
                  <span>📦 {auction._count?.lots || 0} items</span>
                  <span>💰 {formatCurrency(auction.totalSales || 0)} total sales</span>
                  <span>✓ {auction.itemsSold || 0} sold</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        {pastAuctions.length > 3 && !showAll && (
          <div className="text-center mt-6">
            <Button 
              onClick={() => setShowAll(true)}
              variant="outline"
              className="group"
            >
              View All Past Auctions
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {showAll && (
          <div className="text-center mt-6">
            <Button 
              onClick={() => setShowAll(false)}
              variant="ghost"
              size="sm"
            >
              Show Less
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

