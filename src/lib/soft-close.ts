// Staggered close + soft close bidding logic
// Items close 1 minute apart starting from auction end time.
// If a bid lands in the soft-close window, that item's timer extends.

const STAGGER_INTERVAL_MS = 60_000 // 1 minute between items

/**
 * Get the base (pre-soft-close) closing time for an item at a given position.
 * Item 0 closes at auctionEndsAt, item 1 at +1 min, item 2 at +2 min, etc.
 */
export function getStaggeredEndTime(
  auctionEndsAt: Date | string,
  itemIndex: number
): Date {
  const base = new Date(auctionEndsAt)
  return new Date(base.getTime() + itemIndex * STAGGER_INTERVAL_MS)
}

/**
 * Calculate the effective end time for a lot, incorporating both stagger and soft close.
 * @param itemBaseEndTime - the staggered base end time for this item (use getStaggeredEndTime)
 * @param lastBidTime     - when the last bid was placed on this item
 * @param softCloseExtendSec - how many seconds to extend after a late bid (default 120 = 2 min)
 */
export function calculateItemEndTime(
  itemBaseEndTime: Date | string,
  lastBidTime: Date | string | null,
  softCloseWindowSec: number = 120,
  softCloseExtendSec: number = 120
): Date {
  const baseEnd = new Date(itemBaseEndTime)

  if (!lastBidTime) {
    return baseEnd
  }

  const lastBid = new Date(lastBidTime)
  const extensionMs = softCloseExtendSec * 1000

  // If the last bid was within the soft-close window, extend
  const itemCloseTime = new Date(lastBid.getTime() + extensionMs)

  return itemCloseTime > baseEnd ? itemCloseTime : baseEnd
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
