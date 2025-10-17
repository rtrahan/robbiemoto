// Helper functions for auction logic

export function getAuctionStatus(auction: { startsAt: Date | string; endsAt: Date | string }): string {
  const now = new Date()
  const start = new Date(auction.startsAt)
  const end = new Date(auction.endsAt)
  
  if (now < start) {
    return 'PREVIEW'
  } else if (now >= start && now < end) {
    return 'LIVE'
  } else {
    return 'ENDED'
  }
}

export function isAuctionLive(auction: { startsAt: Date | string; endsAt: Date | string }): boolean {
  return getAuctionStatus(auction) === 'LIVE'
}

