import { CountdownHero } from '@/components/landing/countdown-hero'
import { LiveAuctionView } from '@/components/live-auction-view'
import { LiveCountdown } from '@/components/live-countdown'
import { UpcomingAuctionPreview } from '@/components/upcoming-auction-preview'
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
          <a href="/" className="font-serif text-xl font-light tracking-tight text-gray-900 hover:opacity-70 transition-opacity">
            ROBBIEMOTO
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
    
    // Try to get live auction first
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
    
    // Get next upcoming auction
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
  } catch (error) {
    console.log('Database not available, using mock auction')
    // Return mock auction for demo
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return {
      id: '1',
      slug: 'spring-collection-2025',
      name: 'Spring Collection 2025',
      description: 'Monthly drop of handcrafted ceramic mugs',
      startsAt: nextWeek,
      endsAt: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'preview' as const,
      published: true,
      _count: { lots: 12 },
    }
  }
}
