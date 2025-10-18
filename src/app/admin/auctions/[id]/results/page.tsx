import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/helpers'
import { getAuctionStatus } from '@/lib/auction-helpers'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Download, Trophy, User } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AuctionResultsPage({ params }: PageProps) {
  const { id } = await params
  
  const auctionData = await getAuctionResults(id)
  
  if (!auctionData) {
    notFound()
  }
  
  const status = getAuctionStatus(auctionData)
  const totalSold = auctionData.lots.filter((l: any) => l.sold).length
  const totalRevenue = auctionData.lots.reduce((sum: number, l: any) => 
    sum + (l.sold ? (l.currentBidCents || 0) : 0), 0
  )
  const totalBids = auctionData.lots.reduce((sum: number, l: any) => 
    sum + (l._count?.bids || 0), 0
  )
  
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/auctions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{auctionData.name}</h1>
              {status === 'LIVE' ? (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  🔴 {status}
                </Badge>
              ) : status === 'ENDED' ? (
                <Badge variant="outline">{status}</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">{status}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(auctionData.startsAt)} → {formatDateTime(auctionData.endsAt)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/admin/auctions/${id}/edit`}>
            <Button variant="outline" size="sm">
              Edit Auction
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Live Status Alert */}
      {status === 'LIVE' && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <p className="text-sm text-blue-700 font-medium">
              🔴 Auction is currently live - Results update in real-time
            </p>
          </div>
        </Card>
      )}
      
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Items Sold</p>
            <p className="text-3xl font-bold">{totalSold}</p>
            <p className="text-xs text-muted-foreground">of {auctionData.lots.length} items</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">from sold items</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Average Sale</p>
            <p className="text-3xl font-bold">
              {totalSold > 0 ? formatCurrency(Math.round(totalRevenue / totalSold)) : '$0'}
            </p>
            <p className="text-xs text-muted-foreground">per item</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Bids</p>
            <p className="text-3xl font-bold">{totalBids}</p>
            <p className="text-xs text-muted-foreground">all bidders</p>
          </div>
        </Card>
      </div>

      {/* Items with Winners */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Auction Results by Item</h2>
          
          <div className="space-y-6">
            {auctionData.lots.map((lot: any, idx: number) => (
              <div key={lot.id} className={`pb-6 ${idx < auctionData.lots.length - 1 ? 'border-b' : ''}`}>
                <div className="flex gap-4">
                  {/* Item Image */}
                  {lot.mediaUrls && Array.isArray(lot.mediaUrls) && lot.mediaUrls.length > 0 && (
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={lot.mediaUrls[0]} 
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">{lot.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{lot.condition}</p>
                      </div>
                      
                      {lot.sold ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Trophy className="h-3 w-3 mr-1" />
                          Sold
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Not Sold
                        </Badge>
                      )}
                    </div>
                    
                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Starting</p>
                        <p className="font-medium">{formatCurrency(lot.startingBidCents)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reserve</p>
                        <p className="font-medium">{formatCurrency(lot.reserveCents)}</p>
                      </div>
                      {lot.sold && lot.currentBidCents && (
                        <div>
                          <p className="text-xs text-muted-foreground">Final Price</p>
                          <p className="font-bold text-green-600 text-lg">{formatCurrency(lot.currentBidCents)}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Winner Info */}
                    {lot.sold && lot.bids && lot.bids.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-700">WINNER</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-sm">{lot.bids[0].user.name || lot.bids[0].user.alias}</p>
                            <p className="text-xs text-gray-600">{lot.bids[0].user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Bid History */}
                    {lot.bids && lot.bids.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                          Bid History ({lot.bids.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {lot.bids.map((bid: any, bidIdx: number) => (
                            <div 
                              key={bid.id}
                              className={`flex items-center justify-between p-2 rounded text-sm ${
                                bidIdx === 0 && lot.sold
                                  ? 'bg-green-100 border border-green-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-mono">
                                  #{lot.bids.length - bidIdx}
                                </span>
                                <div>
                                  <p className="font-medium text-sm">
                                    {bid.user.name || bid.user.alias}
                                  </p>
                                  <p className="text-xs text-gray-500">{bid.user.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${
                                  bidIdx === 0 && lot.sold ? 'text-green-700' : 'text-gray-900'
                                }`}>
                                  {formatCurrency(bid.amountCents)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(bid.placedAt).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!lot.bids || lot.bids.length === 0) && (
                      <p className="text-sm text-gray-400 italic">No bids placed on this item</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

async function getAuctionResults(id: string) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        lots: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { bids: true } },
            bids: {
              orderBy: { placedAt: 'desc' },
              include: {
                user: {
                  select: {
                    name: true,
                    alias: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    
    return auction
  } catch (error) {
    console.log('Prisma failed, using Supabase for results')
    
    try {
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        return null
      }
      
      const { data: auction } = await supabaseServer
        .from('Auction')
        .select('*, lots:Lot(*, bids:Bid(*, user:User(name, alias, email)))')
        .eq('id', id)
        .single()
      
      if (!auction) {
        return null
      }
      
      // Sort bids by date (most recent first)
      auction.lots = auction.lots.map((lot: any) => ({
        ...lot,
        bids: (lot.bids || []).sort((a: any, b: any) => 
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
        ),
        _count: { bids: lot.bids?.length || 0 },
      }))
      
      return auction
    } catch (supabaseError) {
      console.error('Failed to fetch auction results:', supabaseError)
      return null
    }
  }
}

