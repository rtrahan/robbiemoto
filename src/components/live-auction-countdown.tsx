'use client'

import { useEffect, useState } from 'react'
import { LiveCountdown } from './live-countdown'

export function LiveAuctionCountdown({ auction }: { auction: any }) {
  const [hasExtendedItems, setHasExtendedItems] = useState(false)
  
  useEffect(() => {
    // Check for extended items periodically
    const checkExtendedItems = async () => {
      try {
        const response = await fetch(`/api/auctions/${auction.id}/lots`)
        if (response.ok) {
          const lots = await response.json()
          const anyExtended = lots.some((lot: any) => lot.isExtended)
          setHasExtendedItems(anyExtended)
        }
      } catch (error) {
        console.error('Failed to check extended items')
      }
    }
    
    checkExtendedItems()
    
    // Re-check every 5 seconds
    const interval = setInterval(checkExtendedItems, 5000)
    return () => clearInterval(interval)
  }, [auction.id])
  
  return (
    <div className="fixed top-16 z-40 w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      <div className="w-full px-4 py-2 md:py-3">
        <div className="flex items-center justify-center gap-3 md:gap-6">
          <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 whitespace-nowrap">
            🔴 {hasExtendedItems ? 'Extended' : 'Ends In'}
          </div>
          <LiveCountdown endsAt={auction.endsAt} />
          {hasExtendedItems && (
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider animate-pulse hidden md:inline">
              Extended Bidding
            </span>
          )}
          <div className="text-[10px] md:text-xs text-gray-400 hidden lg:block truncate max-w-xs">{auction.name}</div>
        </div>
      </div>
    </div>
  )
}

