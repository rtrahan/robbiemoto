import { AuthHeader } from '@/components/auth-header'
import { PastAuctionsSection } from '@/components/past-auctions-section'

export const metadata = {
  title: 'Past Auctions - Robbiemoto',
  description: 'Browse past ceramic auction results and prices',
}

export default function AuctionsPage() {
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

      <main className="pt-16">
        <div className="container px-4 pt-8 md:px-8">
          <PastAuctionsSection />
        </div>
      </main>
    </div>
  )
}

