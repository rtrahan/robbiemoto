'use client'

import { useEffect, useState } from 'react'
import { CountdownHero } from './landing/countdown-hero'

export function UpcomingAuctionPreview({ auction }: { auction: any }) {
  const [lots, setLots] = useState<any[]>([])

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await fetch(`/api/auctions/${auction.id}/lots`)
        if (response.ok) {
          const data = await response.json()
          setLots(data)
        }
      } catch (error) {
        console.error('Failed to fetch preview items')
      }
    }
    
    fetchLots()
  }, [auction.id])

  return (
    <div className="relative min-h-screen bg-white">
      {/* Main Countdown */}
      <CountdownHero />
      
      {/* CTA Banner - Prominent */}
      <div className="bg-gray-900 text-white py-6">
        <div className="container px-4 md:px-8 text-center">
          <p className="text-sm mb-3">
            🏺 Create an account to bid when auction goes live
          </p>
          <a 
            href="/login"
            className="inline-block bg-white text-gray-900 px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Sign Up to Bid
          </a>
        </div>
      </div>
      
      {/* Simple Preview Grid Below */}
      {lots.length > 0 && (
        <div className="container px-4 py-16 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Preview
              </h2>
              <p className="text-sm text-gray-600">
                {auction.description}
              </p>
            </div>

            {/* Simple Grid - First 6 Items */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {lots.slice(0, 6).map((lot) => (
                <div key={lot.id} className="group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all relative">
                    {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
                      <img 
                        src={lot.mediaUrls[0]} 
                        alt={lot.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-4xl opacity-10">🏺</div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2 line-clamp-1">
                    {lot.title}
                  </p>
                </div>
              ))}
            </div>

            {lots.length > 6 && (
              <p className="text-center text-xs text-gray-400 mt-6">
                + {lots.length - 6} more items
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
