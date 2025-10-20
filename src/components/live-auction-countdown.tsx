'use client'

import { useEffect, useState } from 'react'
import { LiveCountdown } from './live-countdown'

export function LiveAuctionCountdown({ auction }: { auction: any }) {
  const [hasExtendedItems, setHasExtendedItems] = useState(false)
  const [latestItemEndTime, setLatestItemEndTime] = useState<string | null>(null)
  
  useEffect(() => {
    // Check for extended items periodically
    const checkExtendedItems = async () => {
      try {
        const response = await fetch(`/api/auctions/${auction.id}/lots`)
        if (response.ok) {
          const lots = await response.json()
          const anyExtended = lots.some((lot: any) => lot.isExtended)
          setHasExtendedItems(anyExtended)
          
          // Find the latest item end time
          if (anyExtended) {
            const latestTime = lots.reduce((latest: string | null, lot: any) => {
              if (!lot.effectiveEndTime) return latest
              if (!latest) return lot.effectiveEndTime
              return new Date(lot.effectiveEndTime) > new Date(latest) ? lot.effectiveEndTime : latest
            }, null)
            setLatestItemEndTime(latestTime)
          } else {
            setLatestItemEndTime(null)
          }
        }
      } catch (error) {
        console.error('Failed to check extended items')
      }
    }
    
    checkExtendedItems()
    
    // Re-check every 3 seconds
    const interval = setInterval(checkExtendedItems, 3000)
    return () => clearInterval(interval)
  }, [auction.id])
  
  // Use latest item end time if in extended bidding, otherwise auction end time
  const displayEndTime = hasExtendedItems && latestItemEndTime ? latestItemEndTime : auction.endsAt
  
  return (
    <div className="fixed top-16 z-40 w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      <div className="w-full px-4 py-2 md:py-3">
        <div className="flex items-center justify-center gap-3 md:gap-6">
          <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 whitespace-nowrap">
            🔴 {hasExtendedItems ? 'Last Item' : 'Ends In'}
          </div>
          <LiveCountdown key={displayEndTime} endsAt={displayEndTime} />
          {hasExtendedItems && (
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider animate-pulse hidden md:inline">
              Extended
            </span>
          )}
          <div className="text-[10px] md:text-xs text-gray-400 hidden lg:block truncate max-w-xs">{auction.name}</div>
        </div>
      </div>
    </div>
  )
}

