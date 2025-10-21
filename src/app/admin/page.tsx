import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime } from '@/lib/helpers'
import { getAuctionStatus } from '@/lib/auction-helpers'
import Link from 'next/link'
import { Gavel, Package, Plus, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Overview of your auctions and shop',
}

export default async function AdminDashboard() {
  const { auctions, products, stats } = await getDashboardData()
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your auctions and shop
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new">
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>
          <Link href="/admin/auctions/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Auction
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats - Mobile Responsive Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Total Auctions</p>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalAuctions}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.publishedAuctions} published • {stats.totalAuctions - stats.publishedAuctions} draft
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Live Auction</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.liveAuctions}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.activeBids} active bids
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Auction Items</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalLots}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.publishedLots} published
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Shop Products</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.activeProducts} active
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Total Value</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCurrentBids)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Leading bids only
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Registered Users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.activeBidders} active bidders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Auctions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Auctions</CardTitle>
              <Link href="/admin/auctions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {auctions.length > 0 ? (
              <div className="space-y-4">
                {auctions.slice(0, 3).map((auction) => (
                  <div 
                    key={auction.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{auction.name}</h3>
                        <StatusBadge status={auction.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📅 {formatDateTime(auction.startsAt)} → {formatDateTime(auction.endsAt)}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>📦 {auction._count?.lots || 0} items</span>
                        <span>🔨 {(auction as any).totalBids || 0} bids</span>
                      </div>
                    </div>
                    <Link href={`/admin/auctions/${auction.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No auctions yet</p>
                <Link href="/admin/auctions/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Auction
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Link href="/admin/products">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 3).map((product: any) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3 flex-1">
                      {product.mediaUrls?.[0] && (
                        <img 
                          src={product.mediaUrls[0]} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <Badge variant={product.status === 'ACTIVE' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                            {product.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>💰 {formatCurrency(product.priceCents)}</span>
                          <span>📦 {product.stockQuantity} in stock</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No products yet</p>
                <Link href="/admin/products/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PREVIEW: 'bg-blue-100 text-blue-700',
    LIVE: 'bg-green-100 text-green-700',
    ENDED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  
  return (
    <Badge variant="outline" className={`text-xs ${colors[status] || 'bg-gray-100'}`}>
      {status === 'LIVE' && '🔴 '}
      {status}
    </Badge>
  )
}

async function getDashboardData() {
  try {
    // Fetch auctions sorted by start date (most recent/upcoming first)
    const auctions = await prisma.auction.findMany({
      orderBy: { startsAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { lots: true } },
        lots: {
          where: { published: true }, // Only count published lots
          select: {
            currentBidCents: true,
            published: true,
            _count: { select: { bids: true } },
          },
        },
      },
    })
    
    // Fetch products sorted by creation date
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        priceCents: true,
        stockQuantity: true,
        status: true,
        mediaUrls: true,
        createdAt: true,
      },
    })
    
    // Sort to prioritize: LIVE first, then PREVIEW (upcoming), then ENDED
    const sortedAuctions = auctions.sort((a, b) => {
      const statusA = getAuctionStatus(a)
      const statusB = getAuctionStatus(b)
      
      // Priority order: LIVE > PREVIEW > ENDED
      const priority: Record<string, number> = { LIVE: 0, PREVIEW: 1, ENDED: 2 }
      
      if (priority[statusA] !== priority[statusB]) {
        return priority[statusA] - priority[statusB]
      }
      
      // Within same status, sort by start date (most recent first)
      return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    })
    
    // Get all lots with bid counts for accurate stats
    const allLots = await prisma.lot.findMany({
      select: {
        id: true,
        currentBidCents: true,
        published: true,
        auctionId: true,
        _count: { select: { bids: true } },
      },
    })
    
    // Get all auctions for counting
    const allAuctions = await prisma.auction.findMany({
      select: {
        id: true,
        status: true,
        published: true,
        startsAt: true,
        endsAt: true,
      },
    })
    
    // Get user counts
    const totalUsers = await prisma.user.count()
    const usersWithBids = await prisma.user.count({
      where: {
        bids: {
          some: {},
        },
      },
    })
    
    // Calculate live auctions based on actual dates
    const liveAuctionIds = allAuctions
      .filter(a => getAuctionStatus(a) === 'LIVE')
      .map(a => a.id)
    
    // Get product counts
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        status: true,
      },
    })
    
    const stats = {
      totalAuctions: allAuctions.length,
      publishedAuctions: allAuctions.filter(a => a.published).length,
      liveAuctions: liveAuctionIds.length,
      totalLots: allLots.length,
      publishedLots: allLots.filter(l => l.published).length,
      totalProducts: allProducts.length,
      activeProducts: allProducts.filter(p => p.status === 'ACTIVE').length,
      totalBids: allLots.reduce((sum, l) => sum + (l._count?.bids || 0), 0),
      totalCurrentBids: allLots.reduce((sum, l) => sum + (l.currentBidCents || 0), 0),
      activeBids: allLots
        .filter(l => liveAuctionIds.includes(l.auctionId))
        .reduce((sum, l) => sum + (l._count?.bids || 0), 0),
      totalUsers,
      activeBidders: usersWithBids,
    }
    
    // Add stats to individual auctions with correct status
    const auctionsWithStats = sortedAuctions.map(auction => {
      const auctionLots = allLots.filter(l => l.auctionId === auction.id)
      const actualStatus = getAuctionStatus(auction)
      
      return {
        ...auction,
        status: actualStatus, // Override with calculated status
        totalBids: auctionLots.reduce((sum, l) => sum + (l._count?.bids || 0), 0),
        currentBidTotal: auctionLots.reduce((sum, l) => sum + (l.currentBidCents || 0), 0),
      }
    })
    
    console.log('Dashboard Stats:', stats)
    console.log('Auctions with Stats:', auctionsWithStats.map(a => ({
      name: a.name,
      totalBids: a.totalBids,
      currentBidTotal: a.currentBidTotal,
    })))
    
    return { auctions: auctionsWithStats, products, stats }
  } catch (error) {
    // Fallback to Supabase (silent)
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        throw new Error('No database available')
      }
      
      // Get auctions with lots
      const { data: auctions } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*)')
        .order('startsAt', { ascending: false })
        .limit(5)
      
      if (!auctions) {
        throw new Error('No data')
      }
      
      // Calculate stats
      const { count: totalAuctions } = await supabaseServer
        .from('Auction')
        .select('*', { count: 'exact', head: true })
      
      const { count: totalUsers } = await supabaseServer
        .from('User')
        .select('*', { count: 'exact', head: true })
      
      // Get all lots to calculate bid totals
      const { data: allLots } = await supabaseServer
        .from('Lot')
        .select('id, currentBidCents, auctionId, published')
      
      // Get total bid count
      const { count: totalBidsCount } = await supabaseServer
        .from('Bid')
        .select('*', { count: 'exact', head: true })
      
      // Calculate stats
      const totalCurrentBids = (allLots || []).reduce((sum: number, lot: any) => 
        sum + (lot.currentBidCents || 0), 0)
      
      const liveAuctionIds = auctions
        .filter((a: any) => getAuctionStatus(a) === 'LIVE')
        .map((a: any) => a.id)
      
      const stats = {
        totalAuctions: totalAuctions || 0,
        publishedAuctions: auctions.filter((a: any) => a.published).length,
        liveAuctions: liveAuctionIds.length,
        totalLots: (allLots || []).length,
        publishedLots: (allLots || []).filter((l: any) => l.published).length,
        totalBids: totalBidsCount || 0,
        totalCurrentBids: totalCurrentBids,
        activeBids: totalBidsCount || 0, // TODO: Filter to live auctions only
        totalUsers: totalUsers || 0,
        activeBidders: 0, // TODO: Count unique bidders
      }
      
      const auctionsWithStats = await Promise.all(
        auctions.map(async (auction: any) => {
          // Get bid count for this auction's lots
          const auctionLotIds = auction.lots?.map((l: any) => l.id) || []
          
          let bidCount = 0
          if (auctionLotIds.length > 0) {
            const { count } = await supabaseServer
              .from('Bid')
              .select('*', { count: 'exact', head: true })
              .in('lotId', auctionLotIds)
            
            bidCount = count || 0
          }
          
          return {
            ...auction,
            status: getAuctionStatus(auction),
            _count: { lots: auction.lots?.length || 0 },
            totalBids: bidCount,
            currentBidTotal: auction.lots?.reduce((sum: number, l: any) => 
              sum + (l.currentBidCents || 0), 0) || 0,
          }
        })
      )
      
      return { auctions: auctionsWithStats, products: [], stats }
    } catch (supabaseError) {
      console.error('Supabase also failed:', supabaseError)
      return {
        auctions: [],
        products: [],
        stats: {
          totalAuctions: 0,
          publishedAuctions: 0,
          liveAuctions: 0,
          totalLots: 0,
          publishedLots: 0,
          totalProducts: 0,
          activeProducts: 0,
          totalBids: 0,
          totalCurrentBids: 0,
          activeBids: 0,
          totalUsers: 0,
          activeBidders: 0,
        },
      }
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
      startsAt: nextWeek,
      endsAt: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'PREVIEW',
      published: true,
      _count: { lots: 12 },
    },
    {
      id: '2',
      name: 'Winter Collection 2024',
      slug: 'winter-2024',
      startsAt: lastMonth,
      endsAt: new Date(lastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'ENDED',
      published: true,
      _count: { lots: 10 },
    },
  ]
}
