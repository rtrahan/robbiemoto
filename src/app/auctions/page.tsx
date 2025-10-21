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
        <div className="container px-4 py-16 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl font-serif font-light mb-4">Past Auctions</h1>
            <p className="text-gray-600 text-lg">
              Browse completed monthly ceramic drops and see what sold
            </p>
          </div>
        </div>

        <PastAuctionsSection />
      </main>
    </div>
  )
}

