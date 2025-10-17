'use client'

import { useEffect, useState } from 'react'
import { formatDateTime, getAuctionStatus } from '@/lib/helpers'
import { Clock, Package } from 'lucide-react'
import type { Auction } from '@prisma/client'

interface AuctionHeaderProps {
  auction: Auction & {
    _count: {
      lots: number
    }
  }
}

export function AuctionHeader({ auction }: AuctionHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [status, setStatus] = useState(() => 
    getAuctionStatus(auction.startsAt, auction.endsAt)
  )
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(auction.startsAt)
      const end = new Date(auction.endsAt)
      const currentStatus = getAuctionStatus(auction.startsAt, auction.endsAt)
      
      setStatus(currentStatus)
      
      if (currentStatus === 'preview') {
        const diff = start.getTime() - now.getTime()
        setTimeRemaining(formatTimeDifference(diff))
      } else if (currentStatus === 'live') {
        const diff = end.getTime() - now.getTime()
        setTimeRemaining(formatTimeDifference(diff))
      } else {
        setTimeRemaining('')
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [auction.startsAt, auction.endsAt])
  
  return (
    <div className="mb-12 space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h1 className="font-serif text-4xl font-light text-gray-900">
              {auction.name}
            </h1>
            <StatusBadge status={status} />
          </div>
          
          {auction.description && (
            <p className="text-sm font-light text-gray-600">
              {auction.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {timeRemaining && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-gray-500">
                {status === 'preview' ? 'Starts in' : 'Ends in'}
              </div>
              <div className="mt-1 font-mono text-2xl font-light text-gray-900">
                {timeRemaining}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              <span className="uppercase tracking-wider">
                {auction._count.lots} {auction._count.lots === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {status === 'preview' && `Starts ${formatDateTime(auction.startsAt)}`}
                {status === 'live' && `Ends ${formatDateTime(auction.endsAt)}`}
                {status === 'ended' && `Ended ${formatDateTime(auction.endsAt)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {status === 'preview' && (
        <div className="border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-600">
            This auction hasn't started yet. You can preview the items below, but bidding will open when the auction goes live.
          </p>
        </div>
      )}
      
      {status === 'ended' && (
        <div className="border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-600">
            This auction has ended. You can view the final results below.
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels = {
    preview: 'Preview',
    live: 'Live',
    ended: 'Ended',
  }
  
  const colors = {
    preview: 'text-gray-500 border-gray-300',
    live: 'text-gray-900 border-gray-900',
    ended: 'text-gray-400 border-gray-200',
  }
  
  return (
    <span 
      className={`border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
        colors[status as keyof typeof colors] || 'text-gray-400 border-gray-200'
      } ${status === 'live' ? 'animate-pulse' : ''}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

function formatTimeDifference(milliseconds: number): string {
  if (milliseconds <= 0) return 'Soon'
  
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}