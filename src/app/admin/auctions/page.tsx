import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/helpers'
import { getAuctionStatus } from '@/lib/auction-helpers'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export const metadata = {
  title: 'Manage Auctions',
  description: 'Create and manage your ceramic auctions',
}

export default async function AdminAuctionsPage() {
  const auctions = await getAuctionsWithLots()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auctions</h1>
          <p className="text-muted-foreground">
            Manage your monthly ceramic drops
          </p>
        </div>
        <Link href="/admin/auctions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Auction
          </Button>
        </Link>
      </div>

      {/* Auctions List */}
      <div className="space-y-4">
        {auctions.map((auction) => {
          const actualStatus = getAuctionStatus(auction)
          return (
          <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex">
              {/* Left - Item Previews */}
              <div className="w-64 bg-gray-50 p-4 border-r flex-shrink-0">
                {(auction as any).lots && (auction as any).lots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(auction as any).lots.slice(0, 6).map((lot: any) => (
                      <div key={lot.id} className="aspect-square rounded overflow-hidden bg-white border">
                        {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
                          <img 
                            src={lot.mediaUrls[0]} 
                            alt={lot.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-2xl opacity-30">🏺</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(auction as any).lots.length > 6 && (
                      <div className="aspect-square rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                        +{(auction as any).lots.length - 6}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No items yet</p>
                  </div>
                )}
              </div>

              {/* Right - Auction Details */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{auction.name}</h2>
                      <StatusBadge status={actualStatus} />
                      {auction.published && (
                        <span className="text-xs text-green-600">Published</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {auction.description}
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>📅 Starts: {formatDateTime(auction.startsAt)}</span>
                      <span>🏁 Ends: {formatDateTime(auction.endsAt)}</span>
                      <span>📦 {auction._count?.lots || 0} items</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/admin/auctions/${auction.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          )
        })}

        {auctions.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No Auctions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first auction to start selling ceramics
            </p>
            <Link href="/admin/auctions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Auction
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PREVIEW: 'bg-blue-100 text-blue-700',
    LIVE: 'bg-green-100 text-green-700',
    ENDED: 'bg-gray-100 text-gray-500',
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

async function getAuctionsWithLots() {
  try {
    const auctions = await prisma.auction.findMany({
      orderBy: { startsAt: 'desc' },
      include: {
        lots: {
          orderBy: { sortOrder: 'asc' },
          take: 7,
        },
        _count: { select: { lots: true } },
      },
    })
    
    return auctions.sort((a, b) => {
      const statusA = getAuctionStatus(a)
      const statusB = getAuctionStatus(b)
      const priority: Record<string, number> = { LIVE: 0, PREVIEW: 1, ENDED: 2 }
      
      if (priority[statusA] !== priority[statusB]) {
        return priority[statusA] - priority[statusB]
      }
      
      return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    })
  } catch (error) {
    // Fallback to Supabase (silent)
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return []
      }
      
      const { data: auctions } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*)')
        .order('startsAt', { ascending: false })
      
      if (!auctions) {
        return []
      }
      
      return auctions
        .map((auction: any) => ({
          ...auction,
          _count: { lots: auction.lots?.length || 0 },
          lots: auction.lots?.slice(0, 7) || [],
        }))
        .sort((a: any, b: any) => {
          const statusA = getAuctionStatus(a)
          const statusB = getAuctionStatus(b)
          const priority: Record<string, number> = { LIVE: 0, PREVIEW: 1, ENDED: 2 }
          
          if (priority[statusA] !== priority[statusB]) {
            return priority[statusA] - priority[statusB]
          }
          
          return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        })
    } catch (supabaseError) {
      console.error('All database connections failed:', supabaseError)
      return []
    }
  }
}

function getMockAuctions() {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return [
    {
      id: '1',
      name: 'Spring Collection 2025',
      slug: 'spring-2025',
      description: 'Fresh spring ceramics with soft colors',
      startsAt: nextWeek,
      endsAt: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'PREVIEW',
      published: true,
      createdAt: now,
      _count: { lots: 12 },
    },
    {
      id: '2',
      name: 'Winter Collection 2024',
      slug: 'winter-2024',
      description: 'Cozy winter mugs',
      startsAt: lastMonth,
      endsAt: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'ENDED',
      published: true,
      createdAt: lastMonth,
      _count: { lots: 10 },
    },
  ]
}
