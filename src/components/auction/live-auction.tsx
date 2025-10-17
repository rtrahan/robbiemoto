'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Gavel, Clock } from 'lucide-react'

interface LiveAuctionProps {
  auction: any
}

export function LiveAuction({ auction }: LiveAuctionProps) {
  const [lots, setLots] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch lots
    const fetchLots = async () => {
      try {
        const response = await fetch(`/api/auctions/${auction.id}/lots`)
        if (response.ok) {
          const data = await response.json()
          setLots(data)
        }
      } catch (error) {
        console.error('Failed to fetch lots')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLots()
  }, [auction.id])

  useEffect(() => {
    // Update countdown every second
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(auction.endsAt).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining('Auction Ended')
        clearInterval(timer)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [auction.endsAt])

  if (isLoading) {
    return (
      <div className="container px-4 py-16 md:px-8">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 md:px-8">
      {/* Header with Countdown */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl font-light text-gray-900 mb-3 md:text-5xl">
          {auction.name}
        </h1>
        <p className="text-gray-600 mb-8">
          {auction.description}
        </p>
        
        {/* Countdown Timer */}
        <div className="inline-flex items-center gap-3 border border-gray-900 px-8 py-4">
          <Clock className="h-5 w-5" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1">
              Ends In
            </div>
            <div className="font-mono text-2xl font-light text-gray-900">
              {timeRemaining}
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">
          {lots.length} {lots.length === 1 ? 'Item' : 'Items'} Available
        </h2>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>

        {lots.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No items in this auction yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LotCard({ lot }: { lot: any }) {
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const currentBid = lot.currentBidCents || lot.startingBidCents
  const minNextBid = currentBid + 500 // $5 increment
  
  const handleQuickBid = async () => {
    // Quick bid - bid the minimum next amount
    await handleBid(minNextBid)
  }
  
  const handleCustomBid = async () => {
    const amountCents = Math.round(parseFloat(bidAmount) * 100)
    if (isNaN(amountCents) || amountCents < minNextBid) {
      toast.error(`Minimum bid is ${formatCurrency(minNextBid)}`)
      return
    }
    await handleBid(amountCents)
  }
  
  const handleBid = async (amountCents: number) => {
    setIsSubmitting(true)
    try {
      // In demo mode, just show success
      toast.success('Bid placed successfully! (Demo mode - requires authentication in production)')
      setBidAmount('')
    } catch (error) {
      toast.error('Failed to place bid')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="group border border-gray-200 bg-white hover:border-gray-400 transition-all">
      {/* Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-6xl opacity-20 mb-2">🏺</div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              {lot.title}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-serif text-lg font-light text-gray-900 mb-1 line-clamp-2">
            {lot.title}
          </h3>
          {lot.condition && (
            <p className="text-xs text-gray-500">{lot.condition}</p>
          )}
        </div>

        {/* Current Bid */}
        <div className="border-t border-gray-100 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            {lot.currentBidCents ? 'Current Bid' : 'Starting Bid'}
          </div>
          <div className="font-serif text-2xl font-light text-gray-900">
            {formatCurrency(currentBid)}
          </div>
          {lot._count?.bids > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'}
            </p>
          )}
          {lot.reserveMet && (
            <span className="inline-block mt-2 border border-gray-900 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-900">
              Reserve Met
            </span>
          )}
        </div>

        {/* Bidding Actions */}
        <div className="space-y-2">
          {/* Quick Bid Button */}
          <Button 
            onClick={handleQuickBid}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            <Gavel className="mr-2 h-4 w-4" />
            Bid {formatCurrency(minNextBid)}
          </Button>

          {/* Custom Bid */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                step="5"
                min={(minNextBid / 100).toFixed(2)}
                placeholder={(minNextBid / 100).toFixed(2)}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-6"
                disabled={isSubmitting}
              />
            </div>
            <Button 
              onClick={handleCustomBid}
              disabled={isSubmitting || !bidAmount}
              variant="outline"
            >
              Bid
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
