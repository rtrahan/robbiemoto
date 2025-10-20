// Soft close bidding logic
// When a bid is placed in the last 2 minutes, reset that item's timer to 2 minutes

export function calculateItemEndTime(
  auctionEndsAt: Date | string,
  lastBidTime: Date | string | null,
  softCloseWindowSec: number = 120, // 2 minutes
  softCloseExtendSec: number = 120  // 2 minutes (reset to this)
): Date {
  const auctionEnd = new Date(auctionEndsAt)
  const now = new Date()
  
  // If no bids yet, use auction end time
  if (!lastBidTime) {
    return auctionEnd
  }
  
  const lastBid = new Date(lastBidTime)
  const extensionMs = softCloseExtendSec * 1000 // 2 minutes in ms
  
  // Calculate when this item should close (2 minutes after last bid)
  const itemCloseTime = new Date(lastBid.getTime() + extensionMs)
  
  // Use whichever is later: auction end or item's extended time
  return itemCloseTime > auctionEnd ? itemCloseTime : auctionEnd
}

export function isInSoftClose(
  auctionEndsAt: Date | string,
  itemEndTime: Date | string,
  softCloseWindowSec: number = 120
): boolean {
  const now = new Date()
  const itemEnd = new Date(itemEndTime)
  const timeRemaining = itemEnd.getTime() - now.getTime()
  const softCloseWindowMs = softCloseWindowSec * 1000
  
  return timeRemaining > 0 && timeRemaining <= softCloseWindowMs
}

