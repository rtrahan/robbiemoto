import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

// Format date/time
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Calculate next minimum bid
export function calculateNextMinBid(currentBidCents: number | null, startingBidCents: number, incrementCents: number = 500): number {
  if (!currentBidCents) {
    return startingBidCents
  }
  return currentBidCents + incrementCents
}

// Check auction status
export function getAuctionStatus(startsAt: Date | string, endsAt: Date | string): 'preview' | 'live' | 'ended' {
  const now = new Date()
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  
  if (isBefore(now, start)) return 'preview'
  if (isAfter(now, end)) return 'ended'
  return 'live'
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Generate unique slug with timestamp
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text)
  const timestamp = Date.now().toString(36).slice(-4)
  return `${baseSlug}-${timestamp}`
}

// Format bid alias (hide part of email for privacy)
export function formatBidderAlias(email: string, name?: string | null): string {
  if (name) {
    const parts = name.split(' ')
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`
    }
    return name
  }
  
  const [username, domain] = email.split('@')
  if (username.length <= 3) {
    return `${username[0]}***`
  }
  return `${username.slice(0, 3)}***`
}

// Calculate total price with shipping and tax
export function calculateOrderTotal(
  priceCents: number,
  shippingCents: number = 899,
  taxRate: number = 0
): {
  subtotal: number
  shipping: number
  tax: number
  total: number
} {
  const subtotal = priceCents
  const shipping = shippingCents
  const tax = Math.round((subtotal + shipping) * taxRate)
  const total = subtotal + shipping + tax
  
  return { subtotal, shipping, tax, total }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate random verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
