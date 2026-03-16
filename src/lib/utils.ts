import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UTC_DATE_FIELDS = ['startsAt', 'endsAt', 'createdAt', 'updatedAt', 'actualEndedAt', 'lastBidAt', 'placedAt', 'paidAt', 'shippedAt', 'deliveredAt', 'sentAt', 'readAt', 'confirmedAt']

/**
 * Supabase returns timestamps without timezone suffix (e.g. "2026-03-16T12:00:00").
 * JS new Date() treats these as local time instead of UTC, causing timezone shifts.
 * This appends "Z" to date-like string fields so they're correctly parsed as UTC.
 */
export function ensureUtcDates<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj }
  for (const field of UTC_DATE_FIELDS) {
    const val = result[field]
    if (typeof val === 'string' && val && !val.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(val)) {
      (result as any)[field] = val + 'Z'
    }
  }
  return result
}

/** Apply ensureUtcDates to each item in an array */
export function ensureUtcDatesArray<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map(ensureUtcDates)
}
