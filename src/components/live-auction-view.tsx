'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Gavel, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ItemCountdown } from '@/components/item-countdown'

interface LiveAuctionViewProps {
  auction: any
}

export function LiveAuctionView({ auction }: LiveAuctionViewProps) {
  const [lots, setLots] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasExtendedItems, setHasExtendedItems] = useState(false)

  useEffect(() => {
    // Fetch lots
    const fetchLots = async () => {
      try {
        const response = await fetch(`/api/auctions/${auction.id}/lots`)
        if (response.ok) {
          const data = await response.json()
          setLots(data)
          
          // Check if any items are in extended bidding
          const anyExtended = data.some((lot: any) => lot.isExtended)
          setHasExtendedItems(anyExtended)
        }
      } catch (error) {
        console.error('Failed to fetch lots')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLots()
    
    // Auto-refresh lots every 3 seconds to pick up extended bidding changes
    const refreshInterval = setInterval(fetchLots, 3000)
    
    return () => clearInterval(refreshInterval)
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
      {/* Header with Global LIVE Badge */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        {/* LIVE Badge - Prominent */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
            Auction Live
          </span>
        </div>
        
        
        <h1 className="font-serif text-4xl font-light text-gray-900 mb-3 md:text-5xl">
          {auction.name}
        </h1>
        <p className="text-gray-600">
          {auction.description}
        </p>
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

function LotCard({ lot: initialLot }: { lot: any }) {
  const [lot, setLot] = useState(initialLot)
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [bidHistory, setBidHistory] = useState<any[]>([])
  const [newBidFlash, setNewBidFlash] = useState(false)
  const [lastBidder, setLastBidder] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isWinning, setIsWinning] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  
  const currentBid = lot.currentBidCents || lot.startingBidCents
  const minNextBid = currentBid + 500 // $5 increment
  
  // Helper to check if URL is a video
  const isVideo = (url: string) => {
    return /\.(mp4|mov|webm|ogg)$/i.test(url)
  }
  
  // Navigate media
  const nextMedia = () => {
    if (lot.mediaUrls && lot.mediaUrls.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % lot.mediaUrls.length)
    }
  }
  
  const prevMedia = () => {
    if (lot.mediaUrls && lot.mediaUrls.length > 1) {
      setCurrentMediaIndex((prev) => (prev - 1 + lot.mediaUrls.length) % lot.mediaUrls.length)
    }
  }
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getUser } = await import('@/lib/supabase-auth')
        const user = await getUser()
        setCurrentUser(user)
        setIsLoggedIn(!!user)
      } catch (error) {
        console.log('Auth check failed (not logged in or error)', error)
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])
  
  // Fetch initial bid history and last bidder on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (lot._count?.bids > 0) {
        try {
          const response = await fetch(`/api/lots/${lot.id}/bids`)
          if (response.ok) {
            const bids = await response.json()
            setBidHistory(bids)
            if (bids.length > 0) {
              const topBid = bids[0]
              setLastBidder(topBid.user?.name || topBid.user?.alias || 'Someone')
              
              // Check if current user is winning
              if (currentUser && topBid.user?.email === currentUser.email) {
                setIsWinning(true)
              } else {
                setIsWinning(false)
              }
            }
          }
        } catch (error) {
          console.error('Failed to load initial bids')
        }
      }
    }
    
    loadInitialData()
  }, [lot.id, lot._count?.bids, currentUser])
  
  // Auto-refresh current bid every 2 seconds for real-time feel
  useEffect(() => {
    const refreshBid = async () => {
      try {
        const response = await fetch(`/api/auctions/${lot.auctionId}/lots`)
        if (response.ok) {
          const lots = await response.json()
          const updatedLot = lots.find((l: any) => l.id === lot.id)
          if (updatedLot && updatedLot.currentBidCents !== lot.currentBidCents) {
            // New bid detected!
            setLot(updatedLot)
            setNewBidFlash(true)
            
            // Get latest bid to show bidder
            const bidsResponse = await fetch(`/api/lots/${lot.id}/bids`)
            if (bidsResponse.ok) {
              const bids = await bidsResponse.json()
              if (bids.length > 0) {
                const topBid = bids[0]
                setLastBidder(topBid.user?.name || topBid.user?.alias || 'Someone')
                setBidHistory(bids)
                
                // Check if current user is winning
                if (currentUser && topBid.user?.email === currentUser.email) {
                  setIsWinning(true)
                } else {
                  setIsWinning(false)
                }
              }
            }
            
            // Flash effect
            setTimeout(() => setNewBidFlash(false), 2000)
          }
        }
      } catch (error) {
        console.error('Failed to refresh bid')
      }
    }
    
    const interval = setInterval(refreshBid, 2000) // Every 2 seconds for real-time
    return () => clearInterval(interval)
  }, [lot.id, lot.currentBidCents, lot.auctionId])
  
  useEffect(() => {
    if (showBidModal && bidHistory.length === 0) {
      fetchBidHistory()
    }
    
    // Auto-refresh bid history every 3 seconds when modal is open
    if (showBidModal) {
      const interval = setInterval(() => {
        fetchBidHistory()
      }, 3000) // Refresh every 3 seconds
      
      return () => clearInterval(interval)
    }
  }, [showBidModal])
  
  const fetchBidHistory = async () => {
    try {
      const response = await fetch(`/api/lots/${lot.id}/bids`)
      if (response.ok) {
        const bids = await response.json()
        setBidHistory(bids)
      }
    } catch (error) {
      console.error('Failed to fetch bids')
    }
  }
  
  const placeBid = async (amountCents: number) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to place a bid')
      window.location.href = '/login'
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get auth token from Supabase
      const { supabase } = await import('@/lib/supabase-auth')
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token
      
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          lotId: lot.id,
          amountCents,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed')
      }
      
      // Update local state
      setLot({
        ...lot,
        currentBidCents: amountCents,
        _count: { ...lot._count, bids: (lot._count?.bids || 0) + 1 },
      })
      
      setBidAmount('')
      toast.success(`Bid placed: ${formatCurrency(amountCents)}!`)
      
      // Refresh history if modal is open
      if (showBidModal) {
        fetchBidHistory()
      }
      
      // Trigger immediate refresh of parent (all lots) to update soft close times
      onLotUpdate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleQuickBid = async () => {
    if (!isLoggedIn) {
      toast.error('Sign in to place a bid')
      window.location.href = '/login'
      return
    }
    await placeBid(minNextBid)
  }
  
  const handleCustomBid = async () => {
    if (!isLoggedIn) {
      toast.error('Sign in to place a bid')
      window.location.href = '/login'
      return
    }
    
    const amountCents = Math.round(parseFloat(bidAmount) * 100)
    if (isNaN(amountCents) || amountCents < minNextBid) {
      toast.error(`Minimum bid is ${formatCurrency(minNextBid)}`)
      return
    }
    
    await placeBid(amountCents)
  }
  
  const toggleBidHistory = () => {
    setShowBidModal(!showBidModal)
    if (!showBidModal && bidHistory.length === 0) {
      fetchBidHistory()
    }
  }
  
  // Check if item is in soft close (last 2 minutes)
  const isInSoftClose = lot.isExtended || (lot.effectiveEndTime && new Date(lot.effectiveEndTime) > new Date(lot.auction?.endsAt))
  
  return (
    <div className={`group border-2 bg-white hover:border-gray-400 transition-all ${
      isWinning 
        ? 'border-green-500 shadow-lg shadow-green-100' 
        : isInSoftClose
        ? 'border-orange-500 shadow-lg shadow-orange-100'
        : 'border-gray-200'
    }`}>
      {/* Media Carousel */}
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        {/* Per-Item Countdown for Soft Close */}
        {(lot.isExtended || lot.effectiveEndTime) && (
          <ItemCountdown 
            key={lot.effectiveEndTime} 
            endsAt={lot.effectiveEndTime || lot.auction?.endsAt} 
            isExtended={lot.isExtended}
          />
        )}
        {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
          <>
            {/* Current Media */}
            {isVideo(lot.mediaUrls[currentMediaIndex]) ? (
              <video 
                key={currentMediaIndex}
                src={lot.mediaUrls[currentMediaIndex]}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
                poster={lot.mediaUrls.find((url: string) => !isVideo(url))}
              />
            ) : (
              <img 
                src={lot.mediaUrls[currentMediaIndex]} 
                alt={lot.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Navigation Arrows - only show if multiple media */}
            {lot.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  aria-label="Next"
                >
                  ›
                </button>
                
                {/* Media Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {lot.mediaUrls.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`transition-all ${
                        idx === currentMediaIndex 
                          ? 'w-6 h-1.5 bg-white' 
                          : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                      } rounded-full`}
                      aria-label={`Go to media ${idx + 1}`}
                    />
                  ))}
                </div>
                
                {/* Media Type Badge */}
                {isVideo(lot.mediaUrls[currentMediaIndex]) && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <span>▶</span> Video
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-6xl opacity-20 mb-2">🏺</div>
              <p className="text-xs uppercase tracking-wider text-gray-400 px-4">
                {lot.title}
              </p>
            </div>
          </div>
        )}
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
        <div className={`border-t pt-3 transition-all ${
          newBidFlash ? 'bg-yellow-50 -mx-4 px-4 py-3 border-yellow-200' : 
          isWinning ? 'bg-green-50 -mx-4 px-4 py-3 border-green-200' : 
          'border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`text-[10px] uppercase tracking-wider ${
              isWinning ? 'text-green-700 font-semibold' : 'text-gray-500'
            }`}>
              {lot.currentBidCents ? 'Current Bid' : 'Starting Bid'}
            </div>
            {isWinning && (
              <span className="text-[10px] text-green-700 font-bold">
                🏆 You're Winning!
              </span>
            )}
          </div>
          
          <div className={`font-serif text-2xl font-light ${
            isWinning ? 'text-green-700' : 'text-gray-900'
          }`}>
            {formatCurrency(currentBid)}
          </div>
          
          {lastBidder && lot.currentBidCents && (
            <p className={`text-xs mt-1 ${
              isWinning ? 'text-green-700 font-medium' : 'text-gray-600'
            }`}>
              {isWinning ? 'Your bid' : lastBidder} • {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'}
            </p>
          )}
          
          {!lastBidder && lot._count?.bids > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'}
            </p>
          )}
          
          {/* Item-specific countdown for extended bidding removed reserve met indicator */}
          
          {newBidFlash && (
            <div className="text-xs text-yellow-700 font-medium mt-2 animate-pulse">
              ⚡ New bid just placed!
            </div>
          )}
        </div>

        {/* Bidding Actions */}
        <div className="space-y-2">
          {!isLoggedIn && (
            <a 
              href="/login"
              className="block bg-blue-50 border border-blue-200 rounded p-3 mb-2 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <p className="text-xs text-blue-700 text-center font-medium">
                🔒 Sign in to place a bid →
              </p>
            </a>
          )}
          
          {/* Quick Bid Button */}
          <Button 
            onClick={isLoggedIn ? handleQuickBid : () => window.location.href = '/login'}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            <Gavel className="mr-2 h-4 w-4" />
            {isLoggedIn ? `Bid ${formatCurrency(minNextBid)}` : 'Sign In to Bid'}
          </Button>

          {/* Custom Bid */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
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

          {/* Bid History Toggle */}
          {lot._count?.bids > 0 && (
            <button
              onClick={toggleBidHistory}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-2 border-t hover:bg-gray-50 transition-colors"
            >
              📊 View Bid History ({lot._count.bids})
            </button>
          )}
        </div>
      </div>
      
      {/* Bid History Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bid History</DialogTitle>
            <DialogDescription>
              {lot.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Item Context */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-4">
              {lot.mediaUrls && Array.isArray(lot.mediaUrls) && lot.mediaUrls.length > 0 && (
                <div className="w-20 h-20 bg-white rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={lot.mediaUrls[0]} 
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{lot.title}</h3>
                <div className="flex gap-4 text-xs text-gray-600">
                  <div>
                    <span className="text-muted-foreground">Starting:</span>
                    <span className="font-medium ml-1">{formatCurrency(lot.startingBidCents)}</span>
                  </div>
                  {lot.currentBidCents && (
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-bold text-green-600 ml-1">{formatCurrency(lot.currentBidCents)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bid List */}
            {bidHistory.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {bidHistory.length} {bidHistory.length === 1 ? 'Bid' : 'Bids'} Placed
                </p>
                {bidHistory.map((bid, idx) => (
                  <div 
                    key={bid.id}
                    className={`p-3 rounded-lg border ${
                      idx === 0 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          idx === 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          #{bidHistory.length - idx}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {bid.user?.name || bid.user?.alias || 'Anonymous'}
                          </p>
                          {bid.user?.email === currentUser?.email && (
                            <p className="text-xs text-green-600 font-medium">You</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          idx === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(bid.amountCents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bid.placedAt).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <span className="text-xs text-green-700 font-medium">🏆 Leading Bid</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading bid history...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
