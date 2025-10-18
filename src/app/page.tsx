import { CountdownHero } from '@/components/landing/countdown-hero'
import { LiveAuctionView } from '@/components/live-auction-view'
import { LiveCountdown } from '@/components/live-countdown'
import { UpcomingAuctionPreview } from '@/components/upcoming-auction-preview'
import { PastAuctionsSection } from '@/components/past-auctions-section'
import { AuthHeader } from '@/components/auth-header'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Robbiemoto - Handcrafted Ceramic Auctions',
  description: 'Monthly auctions for one-of-a-kind handcrafted mugs and ceramics',
}

export default async function HomePage() {
  const auction = await getCurrentOrNextAuction()
  
  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <a href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Robbiemoto" 
              className="h-8 w-auto"
            />
          </a>
          <AuthHeader />
        </div>
      </header>

      {/* Countdown Bar - Full Width, Sticky */}
      {auction?.status === 'live' && (
        <div className="fixed top-16 z-40 w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
          <div className="w-full px-4 py-2 md:py-3">
            <div className="flex items-center justify-center gap-2 md:gap-6">
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-gray-400 whitespace-nowrap">Ends In</div>
              <LiveCountdown endsAt={auction.endsAt} />
              <div className="text-[10px] md:text-xs text-gray-400 hidden lg:block truncate max-w-xs">{auction.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={auction?.status === 'live' ? 'pt-28' : 'pt-16'}>
        {auction ? (
          auction.status === 'live' ? (
            // LIVE AUCTION - Show items grid with countdown
            <LiveAuctionView auction={auction} />
          ) : (
            // UPCOMING - Show countdown + item previews
            <UpcomingAuctionPreview auction={auction} />
          )
        ) : (
          // No auction scheduled
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-gray-900 mb-4">
                Next Drop Coming Soon
              </h2>
              <p className="text-sm text-gray-600">
                Check back for our next monthly ceramic auction
              </p>
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
    
    // Try Prisma first (works on localhost)
    try {
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
        return { ...liveAuction, status: 'live' as const }
      }
      
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
      
      return nextAuction ? { ...nextAuction, status: 'preview' as const } : null
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
