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
  
  // Function to refresh lot data
  const refreshLots = async () => {
    try {
      const response = await fetch(`/api/auctions/${auction.id}/lots`)
      if (response.ok) {
        const data = await response.json()
        
        setLots(prev => {
          if (prev.length === 0) return data
          
          const updatedMap = new Map(data.map((lot: any) => [lot.id, lot]))
          
          const merged = prev.map((existing: any) => {
            const updated = updatedMap.get(existing.id)
            return updated || existing
          })
          
          data.forEach((lot: any) => {
            if (!prev.some((p: any) => p.id === lot.id)) {
              merged.push(lot)
            }
          })
          
          return merged
        })
        
        const anyExtended = data.some((lot: any) => lot.isExtended)
        setHasExtendedItems(anyExtended)
      }
    } catch (error) {
      console.error('Failed to fetch lots')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshLots()
    
    // Auto-refresh lots every 3 seconds to pick up extended bidding changes
    const refreshInterval = setInterval(refreshLots, 3000)
    
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
        
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} onLotUpdate={refreshLots} />
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

function LotCard({ lot: initialLot, onLotUpdate }: { lot: any; onLotUpdate: () => void }) {
  const [lot, setLot] = useState(initialLot)
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Update lot when parent refreshes data
  useEffect(() => {
    setLot(initialLot)
  }, [initialLot.effectiveEndTime, initialLot.currentBidCents, initialLot.lastBidAt])
  const [bidHistory, setBidHistory] = useState<any[]>([])
  const [newBidFlash, setNewBidFlash] = useState(false)
  const [lastBidder, setLastBidder] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isWinning, setIsWinning] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailMediaIndex, setDetailMediaIndex] = useState(0)
  
  const currentBid = lot.currentBidCents || lot.startingBidCents
  const minNextBid = currentBid + 500 // $5 increment
  const hasReserve = lot.reserveCents && lot.reserveCents > 0
  const reserveMet = hasReserve && lot.currentBidCents >= lot.reserveCents
  
  // Calculate if item is closed
  const effectiveEndTime = lot.effectiveEndTime || lot.auction?.endsAt
  const isClosed = effectiveEndTime ? new Date(effectiveEndTime) < new Date() : false
  const isExtended = lot.isExtended || false
  
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
  
  // Detect bid changes from parent refresh (no per-card polling needed)
  useEffect(() => {
    if (initialLot.currentBidCents !== lot.currentBidCents && initialLot.currentBidCents) {
      setNewBidFlash(true)
      setTimeout(() => setNewBidFlash(false), 2000)
      
      // Refresh bid history to show latest bidder
      const refreshBidder = async () => {
        try {
          const bidsResponse = await fetch(`/api/lots/${lot.id}/bids`)
          if (bidsResponse.ok) {
            const bids = await bidsResponse.json()
            if (bids.length > 0) {
              const topBid = bids[0]
              setLastBidder(topBid.user?.name || topBid.user?.alias || 'Someone')
              setBidHistory(bids)
              setIsWinning(!!(currentUser && topBid.user?.email === currentUser.email))
            }
          }
        } catch (error) {
          console.error('Failed to refresh bid info')
        }
      }
      refreshBidder()
    }
  }, [initialLot.currentBidCents])
  
  useEffect(() => {
    if (showDetail && bidHistory.length === 0) {
      fetchBidHistory()
    }

    if (showDetail) {
      const interval = setInterval(fetchBidHistory, 3000)
      return () => clearInterval(interval)
    }
  }, [showDetail])
  
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
      
      if (showDetail) {
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
    setShowDetail(true)
    setDetailMediaIndex(0)
    fetchBidHistory()
  }
  
  // Check if item is in soft close (last 2 minutes)
  const isInSoftClose = lot.isExtended || (lot.effectiveEndTime && new Date(lot.effectiveEndTime) > new Date(lot.auction?.endsAt))
  
  return (
    <div className={`group rounded-lg overflow-hidden border bg-white transition-all ${
      isClosed
        ? 'border-gray-300 opacity-70'
        : isWinning 
        ? 'border-green-500 shadow-md shadow-green-100' 
        : isInSoftClose
        ? 'border-orange-500 shadow-md shadow-orange-100'
        : 'border-gray-200'
    }`}>
      {/* Image — tap to open detail */}
      <div
        className="aspect-[4/3] sm:aspect-square bg-gray-50 overflow-hidden relative cursor-pointer"
        onClick={() => { setDetailMediaIndex(0); setShowDetail(true); fetchBidHistory() }}
      >
        {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
          <>
            {isVideo(lot.mediaUrls[currentMediaIndex]) ? (
              <video 
                key={currentMediaIndex}
                src={lot.mediaUrls[currentMediaIndex]}
                autoPlay muted loop playsInline
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
            {lot.mediaUrls.length > 1 && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {lot.mediaUrls.map((_: any, idx: number) => (
                  <span key={idx} className={`rounded-full ${idx === currentMediaIndex ? 'w-4 h-1 bg-white' : 'w-1 h-1 bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-5xl opacity-15">🏺</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3 space-y-2">
        {/* Row 1: Item # + title + timer */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 shrink-0">
              #{(lot.itemIndex ?? 0) + 1}
            </span>
            {!isClosed && effectiveEndTime && (
              <div className="flex items-center gap-1 shrink-0">
                <ItemCountdown key={lot.effectiveEndTime} endsAt={effectiveEndTime} isExtended={lot.isExtended} inline />
              </div>
            )}
            {isClosed && (
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Closed</span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-tight line-clamp-2">
            {lot.title}
          </h3>
        </div>

        {/* Row 2: Price + reserve */}
        <div className={`rounded-md px-2 py-1.5 -mx-0.5 transition-all ${
          newBidFlash ? 'bg-yellow-50' : 
          isWinning ? 'bg-green-50' : 
          'bg-gray-50'
        }`}>
          <div className="flex items-baseline justify-between">
            <span className={`text-lg sm:text-xl font-bold tabular-nums ${
              isWinning ? 'text-green-700' : 'text-gray-900'
            }`}>
              {formatCurrency(currentBid)}
            </span>
            <span className={`text-[10px] ${isWinning ? 'text-green-600' : 'text-gray-400'}`}>
              {lot.currentBidCents ? `${lot._count?.bids || 0} bid${(lot._count?.bids || 0) !== 1 ? 's' : ''}` : 'Start'}
            </span>
          </div>

          {isWinning && (
            <p className="text-[10px] text-green-700 font-semibold mt-0.5">🏆 You're winning</p>
          )}

          {hasReserve && lot.currentBidCents > 0 && (
            <p className={`text-[10px] font-medium mt-0.5 ${reserveMet ? 'text-green-600' : 'text-amber-600'}`}>
              {reserveMet ? '✓ Reserve met' : '⚠ Reserve not met'}
            </p>
          )}

          {newBidFlash && (
            <p className="text-[10px] text-yellow-700 font-medium mt-0.5 animate-pulse">⚡ New bid!</p>
          )}
        </div>

        {/* Row 3: Actions */}
        {!isClosed ? (
          <div className="space-y-1.5">
            {!isLoggedIn && (
              <a href="/login" className="block text-center text-[10px] text-blue-600 font-medium py-1">
                Sign in to bid →
              </a>
            )}
            <Button 
              onClick={isLoggedIn ? handleQuickBid : () => window.location.href = '/login'}
              disabled={isSubmitting}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
              size="sm"
            >
              <Gavel className="mr-1.5 h-3.5 w-3.5" />
              {isLoggedIn ? `Bid ${formatCurrency(minNextBid)}` : 'Sign In'}
            </Button>

            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <Input
                  type="number"
                  step="5"
                  min={(minNextBid / 100).toFixed(2)}
                  placeholder={(minNextBid / 100).toFixed(0)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-5 h-8 text-xs"
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleCustomBid} disabled={isSubmitting || !bidAmount} variant="outline" size="sm" className="h-8 px-3 text-xs">
                Bid
              </Button>
            </div>
          </div>
        ) : (
          isWinning ? (
            <div className="bg-green-50 border border-green-300 rounded-md p-3 text-center">
              <p className="text-sm font-bold text-green-700">🏆 You Won!</p>
              <p className="text-[10px] text-green-600 mt-0.5">We'll contact you about shipping.</p>
            </div>
          ) : lot._count?.bids > 0 && currentUser ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 text-center">
              <p className="text-xs font-bold text-red-700">Outbid</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
              <p className="text-xs font-bold text-gray-500">Bidding Closed</p>
            </div>
          )
        )}

        <button
          onClick={() => { setDetailMediaIndex(0); setShowDetail(true); fetchBidHistory() }}
          className="w-full text-[10px] text-gray-400 hover:text-gray-600 py-1 transition-colors"
        >
          View details{lot._count?.bids > 0 ? ` · ${lot._count.bids} bid${lot._count.bids !== 1 ? 's' : ''}` : ''}
        </button>
      </div>
      
      {/* Item Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 gap-0 max-h-[92vh] flex flex-col overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{lot.title}</DialogTitle>
            <DialogDescription>Item details</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Photo Gallery */}
            {lot.mediaUrls && lot.mediaUrls.length > 0 && (
              <div className="relative bg-black">
                <div className="aspect-square">
                  {isVideo(lot.mediaUrls[detailMediaIndex]) ? (
                    <video
                      key={detailMediaIndex}
                      src={lot.mediaUrls[detailMediaIndex]}
                      autoPlay muted loop playsInline controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={lot.mediaUrls[detailMediaIndex]}
                      alt={lot.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                {lot.mediaUrls.length > 1 && (
                  <>
                    <button onClick={() => setDetailMediaIndex(i => (i - 1 + lot.mediaUrls.length) % lot.mediaUrls.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow" aria-label="Previous">‹</button>
                    <button onClick={() => setDetailMediaIndex(i => (i + 1) % lot.mediaUrls.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow" aria-label="Next">›</button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {lot.mediaUrls.map((_: any, idx: number) => (
                        <button key={idx} onClick={() => setDetailMediaIndex(idx)} className={`rounded-full transition-all ${idx === detailMediaIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'}`} aria-label={`Photo ${idx + 1}`} />
                      ))}
                    </div>
                  </>
                )}
                {/* Thumbnail strip */}
                {lot.mediaUrls.length > 1 && (
                  <div className="flex gap-1 p-2 bg-gray-950 overflow-x-auto">
                    {lot.mediaUrls.map((url: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setDetailMediaIndex(idx)}
                        className={`w-14 h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${idx === detailMediaIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        {isVideo(url) ? (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">▶</div>
                        ) : (
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="p-4 space-y-4">
              {/* Title + timer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-400">Item #{(lot.itemIndex ?? 0) + 1}</span>
                  {!isClosed && effectiveEndTime && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <ItemCountdown key={`detail-${lot.effectiveEndTime}`} endsAt={effectiveEndTime} isExtended={lot.isExtended} inline />
                      <span className="text-gray-400">
                        · closes {new Date(effectiveEndTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {isClosed && <span className="text-xs font-semibold text-gray-500 uppercase">Closed</span>}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{lot.title}</h2>
                {lot.condition && <p className="text-sm text-gray-500 mt-0.5">{lot.condition}</p>}
              </div>

              {/* Description */}
              {lot.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{lot.description}</p>
              )}

              {/* Pricing block */}
              <div className={`rounded-lg p-3 space-y-1 ${isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">{lot.currentBidCents ? 'Current Bid' : 'Starting Bid'}</span>
                  <span className={`text-2xl font-bold tabular-nums ${isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                    {formatCurrency(currentBid)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Starting: {formatCurrency(lot.startingBidCents)}</span>
                  <span>{lot._count?.bids || 0} bid{(lot._count?.bids || 0) !== 1 ? 's' : ''}</span>
                </div>
                {isWinning && <p className="text-xs text-green-700 font-semibold">🏆 You're winning this item</p>}
                {lastBidder && lot.currentBidCents && !isWinning && (
                  <p className="text-xs text-gray-500">Leading: {lastBidder}</p>
                )}
                {hasReserve && lot.currentBidCents > 0 && (
                  <p className={`text-xs font-medium ${reserveMet ? 'text-green-600' : 'text-amber-600'}`}>
                    {reserveMet ? '✓ Reserve met' : '⚠ Reserve not met'}
                  </p>
                )}
              </div>

              {/* Bid actions */}
              {!isClosed ? (
                <div className="space-y-2">
                  {!isLoggedIn && (
                    <a href="/login" className="block bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center text-sm text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                      Sign in to place a bid →
                    </a>
                  )}
                  <Button
                    onClick={isLoggedIn ? handleQuickBid : () => window.location.href = '/login'}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    <Gavel className="mr-2 h-4 w-4" />
                    {isLoggedIn ? `Bid ${formatCurrency(minNextBid)}` : 'Sign In to Bid'}
                  </Button>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <Input
                        type="number" step="5"
                        min={(minNextBid / 100).toFixed(2)}
                        placeholder={`${(minNextBid / 100).toFixed(0)} or more`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-6"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button onClick={handleCustomBid} disabled={isSubmitting || !bidAmount} variant="outline">
                      Bid
                    </Button>
                  </div>
                </div>
              ) : (
                isWinning ? (
                  <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-green-700">🏆 You Won!</p>
                    <p className="text-sm text-green-600 mt-1">Congratulations! We'll contact you about shipping.</p>
                  </div>
                ) : lot._count?.bids > 0 && currentUser ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-red-700">Outbid</p>
                    <p className="text-xs text-red-600">You didn't win this item</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-gray-500">Bidding Closed</p>
                  </div>
                )
              )}

              {/* Bid History */}
              {(lot._count?.bids > 0 || bidHistory.length > 0) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Bid History</p>
                  {bidHistory.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {bidHistory.map((bid, idx) => (
                        <div key={bid.id} className={`flex items-center justify-between px-2.5 py-2 rounded-md text-sm ${idx === 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold ${idx === 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              #{bidHistory.length - idx}
                            </span>
                            <div>
                              <span className="font-medium text-gray-900">{bid.user?.name || bid.user?.alias || 'Anonymous'}</span>
                              {bid.user?.email === currentUser?.email && <span className="text-green-600 text-xs ml-1">(You)</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${idx === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {formatCurrency(bid.amountCents)}
                            </span>
                            <p className="text-[10px] text-gray-400">
                              {new Date(bid.placedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-2">Loading...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
