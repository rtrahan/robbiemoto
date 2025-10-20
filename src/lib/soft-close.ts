// Soft close bidding logic
// When a bid is placed in the last X minutes of an auction,
// that specific ITEM gets extended by Y minutes

export function calculateItemEndTime(
  auctionEndsAt: Date | string,
  lastBidTime: Date | string | null,
  softCloseWindowSec: number = 120, // 2 minutes
  softCloseExtendSec: number = 120  // 2 minutes
): Date {
  const auctionEnd = new Date(auctionEndsAt)
  
  if (!lastBidTime) {
    return auctionEnd
  }
  
  const lastBid = new Date(lastBidTime)
  const timeUntilAuctionEnd = auctionEnd.getTime() - lastBid.getTime()
  const softCloseWindowMs = softCloseWindowSec * 1000
  const extensionMs = softCloseExtendSec * 1000
  
  // If bid was placed within soft close window, extend from that bid time
  if (timeUntilAuctionEnd <= softCloseWindowMs) {
    return new Date(lastBid.getTime() + extensionMs)
  }
  
  return auctionEnd
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

