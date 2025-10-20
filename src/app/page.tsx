import { CountdownHero } from '@/components/landing/countdown-hero'
import { LiveAuctionView } from '@/components/live-auction-view'
import { LiveAuctionCountdown } from '@/components/live-auction-countdown'
import { UpcomingAuctionPreview } from '@/components/upcoming-auction-preview'
import { PastAuctionsSection } from '@/components/past-auctions-section'
import { AuthHeader } from '@/components/auth-header'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Robbiemoto - Handcrafted Ceramic Auctions',
  description: 'Monthly auctions for one-of-a-kind handcrafted mugs and ceramics',
}

// Revalidate every 60 seconds to pick up admin changes
export const revalidate = 60

export default async function HomePage() {
  const auction = await getCurrentOrNextAuction()
  
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <a href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <img 
              src="/robbiemoto-horizontal.pdf" 
              alt="Robbiemoto" 
              className="h-[84px] w-auto"
            />
          </a>
          <AuthHeader />
        </div>
      </header>

      {/* Countdown Bar - Full Width, Sticky */}
      {auction?.status === 'live' && (
        <LiveAuctionCountdown auction={auction} />
      )}

      {/* Main Content */}
      <main className={auction?.status === 'live' ? 'pt-28' : 'pt-16'}>
        {auction ? (
          auction.status === 'live' ? (
            // LIVE AUCTION - Show items grid with countdown
            <LiveAuctionView auction={auction} />
          ) : auction.status === 'preview' ? (
            // UPCOMING - Show countdown + item previews
            <UpcomingAuctionPreview auction={auction} />
          ) : (
            // ENDED - Show completed auction with results link
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
                  Auction Ended
                </span>
                <h2 className="text-5xl font-serif font-light mb-4 text-gray-900">
                  {auction.name}
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  {auction.description}
                </p>
                <div className="flex gap-4 justify-center">
                  <a
                    href={`/auctions/${auction.slug}`}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    View Results & Prices →
                  </a>
                  <a 
                    href="https://instagram.com/robbiemoto" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:border-gray-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Follow for Next Drop
                  </a>
                </div>
              </div>
            </div>
          )
        ) : (
          // NO AUCTION - Show Instagram follow CTA
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-2xl px-4">
              <h2 className="text-4xl font-serif font-light mb-4 text-gray-900">
                No Auction Scheduled
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Our next drop is being curated. Follow us for updates!
              </p>
              <a 
                href="https://instagram.com/robbiemoto" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-medium uppercase tracking-wider hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow @robbiemoto
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {/* Past Auctions Section */}
      <PastAuctionsSection />
      
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          © 2025 Robbiemoto. Handcrafted with care.
        </p>
      </footer>
    </div>
  )
}

async function getCurrentOrNextAuction() {
  try {
    const now = new Date()
    console.log('Looking for auctions at:', now.toISOString())
    
    // Try Prisma first (works on localhost)
    try {
      // First, try to find a live auction
      const liveAuction = await prisma.auction.findFirst({
        where: {
          published: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        include: {
          _count: { select: { lots: true } },
        },
      })
      
      if (liveAuction) {
        console.log('Found LIVE auction:', liveAuction.name)
        return { ...liveAuction, status: 'live' as const }
      }
      
      // Check for auctions in extended bidding (ended but items still open)
      const recentlyEndedAuction = await prisma.auction.findFirst({
        where: {
          published: true,
          startsAt: { lte: now },
          endsAt: { lt: now }, // Ended
        },
        orderBy: { endsAt: 'desc' },
        include: {
          _count: { select: { lots: true } },
          lots: {
            where: { published: true },
            select: { id: true, lastBidAt: true },
          },
        },
      })
      
      if (recentlyEndedAuction) {
        // Check if any items still open due to soft close
        const { calculateItemEndTime } = await import('@/lib/soft-close')
        const hasOpenItems = recentlyEndedAuction.lots.some(lot => {
          const itemEnd = calculateItemEndTime(
            recentlyEndedAuction.endsAt,
            lot.lastBidAt,
            recentlyEndedAuction.softCloseWindowSec,
            recentlyEndedAuction.softCloseExtendSec
          )
          return itemEnd > now
        })
        
        if (hasOpenItems) {
          console.log('Auction in EXTENDED BIDDING:', recentlyEndedAuction.name)
          return { ...recentlyEndedAuction, status: 'live' as const, isExtendedBidding: true }
        }
      }
      
      // If no live auction, look for upcoming
      const nextAuction = await prisma.auction.findFirst({
        where: {
          published: true,
          startsAt: { gt: now },
        },
        orderBy: { startsAt: 'asc' },
        include: {
          _count: { select: { lots: true } },
        },
      })
      
      if (nextAuction) {
        console.log('Found UPCOMING auction:', nextAuction.name, 'starts at:', nextAuction.startsAt)
        return { ...nextAuction, status: 'preview' as const }
      }
      
      // If no upcoming auction, show the most recent ended auction
      const lastEndedAuction = await prisma.auction.findFirst({
        where: {
          published: true,
          endsAt: { lt: now },
        },
        orderBy: { endsAt: 'desc' },
        include: {
          _count: { select: { lots: true } },
        },
      })
      
      if (lastEndedAuction) {
        console.log('Showing recently ENDED auction:', lastEndedAuction.name)
        return { ...lastEndedAuction, status: 'ended' as const }
      }
      
      console.log('No published auctions found')
      return null
    } catch (prismaError) {
      // Prisma failed - try Supabase direct query (silent)
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        throw new Error('No database connection available')
      }
      
      // Try live auction
      const { data: liveAuction } = await supabaseServer
        .from('Auction')
        .select('*, _count:Lot(count)')
        .eq('published', true)
        .lte('startsAt', now.toISOString())
        .gte('endsAt', now.toISOString())
        .single()
      
      if (liveAuction) {
        return { ...liveAuction, status: 'live' as const }
      }
      
      // Try upcoming
      const { data: nextAuction } = await supabaseServer
        .from('Auction')
        .select('*, _count:Lot(count)')
        .eq('published', true)
        .gt('startsAt', now.toISOString())
        .order('startsAt', { ascending: true })
        .limit(1)
        .single()
      
      return nextAuction ? { ...nextAuction, status: 'preview' as const } : null
    }
  } catch (error) {
    console.error('❌ All database connections failed:', error)
    return null
  }
}
