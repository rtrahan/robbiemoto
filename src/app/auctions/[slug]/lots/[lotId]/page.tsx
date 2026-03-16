'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Gavel, ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { ItemCountdown } from '@/components/item-countdown'
import Link from 'next/link'

export default function LotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lotId = params.lotId as string
  const slug = params.slug as string

  const [lot, setLot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidHistory, setBidHistory] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)

  const currentBid = lot?.currentBidCents || lot?.startingBidCents || 0
  const minNextBid = currentBid + 500
  const hasReserve = lot?.reserveCents && lot.reserveCents > 0
  const reserveMet = hasReserve && lot?.currentBidCents >= lot?.reserveCents
  const effectiveEndTime = lot?.effectiveEndTime
  const isClosed = effectiveEndTime ? new Date(effectiveEndTime) < new Date() : false
  const isExtended = lot?.isExtended || false

  const isVideo = (url: string) => /\.(mp4|mov|webm|ogg)$/i.test(url)

  // Check if current user is the leading bidder
  const isWinning = bidHistory.length > 0 && currentUser && bidHistory[0]?.user?.email === currentUser.email

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getUser } = await import('@/lib/supabase-auth')
        const user = await getUser()
        setCurrentUser(user)
        setIsLoggedIn(!!user)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const fetchLot = async () => {
    try {
      const res = await fetch(`/api/lots/${lotId}`)
      if (res.ok) {
        const data = await res.json()
        setLot(data)
      }
    } catch (err) {
      console.error('Failed to fetch lot', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBids = async () => {
    try {
      const res = await fetch(`/api/lots/${lotId}/bids`)
      if (res.ok) {
        const bids = await res.json()
        setBidHistory(bids)
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchLot()
    fetchBids()
    const interval = setInterval(() => { fetchLot(); fetchBids() }, 3000)
    return () => clearInterval(interval)
  }, [lotId])

  const placeBid = async (amountCents: number) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to place a bid')
      window.location.href = '/login'
      return
    }
    setIsSubmitting(true)
    try {
      const { supabase } = await import('@/lib/supabase-auth')
      const session = await supabase?.auth.getSession()
      const token = session?.data?.session?.access_token

      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ lotId, amountCents }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed')

      setBidAmount('')
      toast.success(`Bid placed: ${formatCurrency(amountCents)}!`)
      fetchLot()
      fetchBids()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Item not found</p>
        <Link href="/"><Button variant="outline">Back to Auction</Button></Link>
      </div>
    )
  }

  const mediaUrls: string[] = lot.mediaUrls && Array.isArray(lot.mediaUrls) ? lot.mediaUrls : []

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Auction</span>
          </button>
          <div className="flex items-center gap-2">
            {!isClosed && effectiveEndTime && (
              <>
                <Clock className="h-4 w-4 text-gray-400" />
                <ItemCountdown key={effectiveEndTime} endsAt={effectiveEndTime} isExtended={isExtended} inline />
              </>
            )}
            {isClosed && <span className="text-sm font-semibold text-gray-500">Closed</span>}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Left: Gallery */}
          <div>
            {/* Main image */}
            {mediaUrls.length > 0 ? (
              <div className="relative bg-gray-50">
                <div className="aspect-square sm:aspect-[4/3] lg:aspect-square">
                  {isVideo(mediaUrls[mediaIndex]) ? (
                    <video key={mediaIndex} src={mediaUrls[mediaIndex]} autoPlay muted loop playsInline controls className="w-full h-full object-contain bg-black" />
                  ) : (
                    <img src={mediaUrls[mediaIndex]} alt={lot.title} className="w-full h-full object-contain" />
                  )}
                </div>
                {mediaUrls.length > 1 && (
                  <>
                    <button onClick={() => setMediaIndex(i => (i - 1 + mediaUrls.length) % mediaUrls.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md" aria-label="Previous">‹</button>
                    <button onClick={() => setMediaIndex(i => (i + 1) % mediaUrls.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md" aria-label="Next">›</button>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                <div className="text-7xl opacity-10">🏺</div>
              </div>
            )}

            {/* Thumbnails */}
            {mediaUrls.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {mediaUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMediaIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all ${idx === mediaIndex ? 'border-gray-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {isVideo(url) ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">▶</div>
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Description (desktop: below gallery) */}
            <div className="hidden lg:block px-4 pb-8">
              {lot.description && (
                <div className="pt-6 border-t">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lot.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info + Bidding */}
          <div className="px-4 py-4 lg:py-6 lg:pr-4 lg:pl-0 space-y-5 lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
            {/* Title */}
            <div>
              <p className="text-xs text-gray-400 font-mono mb-1">
                Item #{(lot.itemIndex ?? 0) + 1}
                {effectiveEndTime && !isClosed && (
                  <> · closes {new Date(effectiveEndTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</>
                )}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">{lot.title}</h1>
              {lot.condition && <p className="text-sm text-gray-500 mt-1">{lot.condition}</p>}
            </div>

            {/* Description (mobile: here) */}
            {lot.description && (
              <div className="lg:hidden">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{lot.description}</p>
              </div>
            )}

            {/* Price block */}
            <div className={`rounded-xl p-4 space-y-2 ${isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">{lot.currentBidCents ? 'Current Bid' : 'Starting Bid'}</span>
                <span className={`text-3xl font-bold tabular-nums ${isWinning ? 'text-green-700' : 'text-gray-900'}`}>
                  {formatCurrency(currentBid)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Starting: {formatCurrency(lot.startingBidCents)}</span>
                <span>{lot._count?.bids || 0} bid{(lot._count?.bids || 0) !== 1 ? 's' : ''}</span>
              </div>
              {isWinning && <p className="text-sm text-green-700 font-semibold">🏆 You're winning this item</p>}
              {hasReserve && lot.currentBidCents > 0 && (
                <p className={`text-xs font-medium ${reserveMet ? 'text-green-600' : 'text-amber-600'}`}>
                  {reserveMet ? '✓ Reserve met' : '⚠ Reserve not met'}
                </p>
              )}
            </div>

            {/* Bid actions */}
            {!isClosed ? (
              <div className="space-y-3">
                {!isLoggedIn && (
                  <a href="/login" className="block bg-blue-50 border border-blue-200 rounded-lg p-3 text-center text-sm text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                    Sign in to place a bid →
                  </a>
                )}
                <Button
                  onClick={isLoggedIn ? () => placeBid(minNextBid) : () => { window.location.href = '/login' }}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <Gavel className="mr-2 h-5 w-5" />
                  {isLoggedIn ? `Bid ${formatCurrency(minNextBid)}` : 'Sign In to Bid'}
                </Button>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number" step="5"
                      min={(minNextBid / 100).toFixed(2)}
                      placeholder={`${(minNextBid / 100).toFixed(0)} or more`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="pl-7 h-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const cents = Math.round(parseFloat(bidAmount) * 100)
                      if (isNaN(cents) || cents < minNextBid) {
                        toast.error(`Minimum bid is ${formatCurrency(minNextBid)}`)
                        return
                      }
                      placeBid(cents)
                    }}
                    disabled={isSubmitting || !bidAmount}
                    variant="outline"
                    className="h-10 px-5"
                  >
                    Bid
                  </Button>
                </div>
              </div>
            ) : (
              isWinning ? (
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
                  <p className="text-xl font-bold text-green-700">🏆 You Won!</p>
                  <p className="text-sm text-green-600 mt-1">Congratulations! We'll contact you about shipping.</p>
                </div>
              ) : (lot._count?.bids || 0) > 0 && currentUser ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-red-700">Outbid</p>
                  <p className="text-sm text-red-600">You didn't win this item</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-gray-500">Bidding Closed</p>
                </div>
              )
            )}

            {/* Bid History */}
            {((lot._count?.bids || 0) > 0 || bidHistory.length > 0) && (
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bid History</h3>
                {bidHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {bidHistory.map((bid, idx) => (
                      <div key={bid.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-bold w-5 text-center ${idx === 0 ? 'text-green-600' : 'text-gray-400'}`}>
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
                  <p className="text-sm text-gray-400">Loading bids...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
