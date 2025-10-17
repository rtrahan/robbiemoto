export const APP_NAME = 'Robbiemoto Auctions'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Auction settings (MVP defaults)
export const AUCTION_DEFAULTS = {
  SOFT_CLOSE_WINDOW_SEC: 120, // 2 minutes
  SOFT_CLOSE_EXTEND_SEC: 120, // 2 minutes
  FIXED_INCREMENT_CENTS: 500, // $5
  SHIPPING_FLAT_RATE_CENTS: 899, // $8.99
  TAX_RATE: 0.0, // 0% default
  VIDEO_MAX_SECONDS: 20,
  VIDEO_MAX_MB: 25,
}

// Bid increments
export const BID_INCREMENT = 500 // $5.00 in cents

// Time formats
export const TIME_ZONE = 'America/New_York'

// Pagination
export const ITEMS_PER_PAGE = 12

// File upload limits
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']

// Cache revalidation times (in seconds)
export const REVALIDATE_TIME = {
  STATIC: 3600, // 1 hour
  AUCTION: 60, // 1 minute
  LOT: 30, // 30 seconds
}
