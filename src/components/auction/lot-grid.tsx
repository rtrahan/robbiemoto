import Link from 'next/link'
import { formatCurrency } from '@/lib/helpers'
import { prisma } from '@/lib/prisma'

// Check if we're in demo mode
const isDemoMode = 
  !process.env.DATABASE_URL || 
  process.env.DATABASE_URL.includes('username:password')

interface LotGridProps {
  auctionId: string
}

export async function LotGrid({ auctionId }: LotGridProps) {
  const lots = await getLots(auctionId)
  
  if (lots.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center border border-gray-200 bg-gray-50 p-12 text-center">
        <h3 className="mb-2 font-serif text-2xl font-light text-gray-900">No items in this auction</h3>
        <p className="text-xs text-gray-600">
          Check back later for updates
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {lots.map((lot) => (
        <Link key={lot.id} href={`/lot/${lot.slug}`}>
          <div className="group h-full border border-gray-200 bg-white transition-all hover:border-gray-400">
            <div className="aspect-square overflow-hidden bg-gray-50">
              {lot.media.length > 0 ? (
                <div className="relative h-full w-full">
                  {/* TODO: Add actual image display */}
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-6xl opacity-20">🏺</div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">Image preview</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-6xl opacity-20">🏺</div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">No image</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h3 className="line-clamp-2 font-serif text-lg font-light text-gray-900 group-hover:opacity-70">
                  {lot.title}
                </h3>
                {lot.condition && (
                  <p className="mt-1 text-xs text-gray-500">
                    {lot.condition}
                  </p>
                )}
              </div>
              
              <div className="space-y-3 border-t border-gray-100 pt-3">
                {lot.currentBidCents ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Current bid</div>
                    <div className="mt-1 font-serif text-xl font-light text-gray-900">
                      {formatCurrency(lot.currentBidCents)}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Starting bid</div>
                    <div className="mt-1 font-serif text-xl font-light text-gray-900">
                      {formatCurrency(lot.startingBidCents)}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {lot.buyNowCents && !lot.currentBidCents && (
                    <span className="border border-gray-300 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-600">
                      Buy now: {formatCurrency(lot.buyNowCents)}
                    </span>
                  )}
                  
                  {lot.reserveMet && (
                    <span className="border border-gray-900 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-900">
                      Reserve met
                    </span>
                  )}
                  
                  {lot.sold && (
                    <span className="border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400">
                      Sold
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

async function getLots(auctionId: string) {
  if (isDemoMode) {
    return getMockLots(auctionId)
  }
  
  try {
    return await prisma.lot.findMany({
      where: {
        auctionId,
        published: true,
      },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        _count: {
          select: { bids: true },
        },
      },
    })
  } catch (error) {
    console.error('Database error, using mock data:', error)
    return getMockLots(auctionId)
  }
}

function getMockLots(auctionId: string) {
  const now = new Date()
  
  const mockLots = [
    {
      id: '1',
      auctionId,
      title: 'Handcrafted Ceramic Coffee Mug - Blue Glaze',
      slug: 'ceramic-coffee-mug-blue',
      description: 'Beautiful handcrafted ceramic mug with deep blue glaze',
      condition: 'Excellent',
      startingBidCents: 3500,
      currentBidCents: 15500,
      reserveCents: 10000,
      reserveMet: true,
      buyNowCents: 25000,
      featured: true,
      published: true,
      sold: false,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
      media: [],
      _count: { bids: 12 },
    },
    {
      id: '2',
      auctionId,
      title: 'Leather Wallet - Hand Stitched',
      slug: 'leather-wallet-hand-stitched',
      description: 'Premium leather wallet with hand stitching',
      condition: 'New',
      startingBidCents: 5000,
      currentBidCents: 23000,
      reserveCents: 15000,
      reserveMet: true,
      buyNowCents: 35000,
      featured: true,
      published: true,
      sold: false,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
      media: [],
      _count: { bids: 8 },
    },
    {
      id: '3',
      auctionId,
      title: 'Pottery Bowl Set (3 pieces)',
      slug: 'pottery-bowl-set',
      description: 'Set of three matching pottery bowls',
      condition: 'Excellent',
      startingBidCents: 4500,
      currentBidCents: null,
      reserveCents: 12000,
      reserveMet: false,
      buyNowCents: 28000,
      featured: false,
      published: true,
      sold: false,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
      media: [],
      _count: { bids: 0 },
    },
    {
      id: '4',
      auctionId,
      title: 'Ceramic Vase - Earth Tones',
      slug: 'ceramic-vase-earth-tones',
      description: 'Elegant ceramic vase with natural earth tone glazing',
      condition: 'Good',
      startingBidCents: 2500,
      currentBidCents: 8500,
      reserveCents: 8000,
      reserveMet: true,
      buyNowCents: 18000,
      featured: false,
      published: true,
      sold: false,
      sortOrder: 4,
      createdAt: now,
      updatedAt: now,
      media: [],
      _count: { bids: 5 },
    },
  ]
  
  return mockLots
}