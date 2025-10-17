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
  description: 'Manage your ceramic auctions',
}

export default async function AdminDashboard() {
  const { auctions, stats } = await getDashboardData()
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your monthly ceramic auctions
          </p>
        </div>
        <Link href="/admin/auctions/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Auction
          </Button>
        </Link>
      </div>

      {/* Quick Stats - Compact Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
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
              <p className="text-xs font-medium text-muted-foreground">Total Items</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalLots}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.publishedLots} published
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">Current Bids</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCurrentBids)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {stats.totalBids} total bids
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
              {auctions.slice(0, 5).map((auction) => (
                <div 
                  key={auction.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{auction.name}</h3>
                      <StatusBadge status={auction.status} />
                      {!auction.published && (
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      📅 {formatDateTime(auction.startsAt)} → {formatDateTime(auction.endsAt)}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>📦 {auction._count?.lots || 0} items</span>
                      <span>🔨 {(auction as any).totalBids || 0} bids</span>
                      {(auction as any).currentBidTotal > 0 && (
                        <span>💰 {formatCurrency((auction as any).currentBidTotal)} current</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/auctions/${auction.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No auctions yet</p>
              <Link href="/admin/auctions/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Auction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
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
    
    const stats = {
      totalAuctions: allAuctions.length,
      publishedAuctions: allAuctions.filter(a => a.published).length,
      liveAuctions: liveAuctionIds.length,
      totalLots: allLots.length,
      publishedLots: allLots.filter(l => l.published).length,
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
    
    return { auctions: auctionsWithStats, stats }
  } catch (error) {
    console.log('Prisma error, trying Supabase:', error)
    
    // Fallback to Supabase
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
      
      const stats = {
        totalAuctions: totalAuctions || 0,
        publishedAuctions: auctions.filter((a: any) => a.published).length,
        liveAuctions: auctions.filter((a: any) => getAuctionStatus(a) === 'LIVE').length,
        totalLots: auctions.reduce((sum: number, a: any) => sum + (a.lots?.length || 0), 0),
        publishedLots: auctions.reduce((sum: number, a: any) => 
          sum + (a.lots?.filter((l: any) => l.published).length || 0), 0),
        totalBids: 0,
        totalCurrentBids: 0,
        activeBids: 0,
        totalUsers: totalUsers || 0,
        activeBidders: 0,
      }
      
      const auctionsWithStats = auctions.map((auction: any) => ({
        ...auction,
        status: getAuctionStatus(auction),
        _count: { lots: auction.lots?.length || 0 },
        totalBids: 0,
        currentBidTotal: auction.lots?.reduce((sum: number, l: any) => 
          sum + (l.currentBidCents || 0), 0) || 0,
      }))
      
      return { auctions: auctionsWithStats, stats }
    } catch (supabaseError) {
      console.error('Supabase also failed:', supabaseError)
      return {
        auctions: [],
        stats: {
          totalAuctions: 0,
          publishedAuctions: 0,
          liveAuctions: 0,
          totalLots: 0,
          publishedLots: 0,
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
