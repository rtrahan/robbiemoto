import { Resend } from 'resend'

// Make Resend optional - only initialize if key is present
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@robbiemoto.com'
export const REPLY_TO_EMAIL = 'support@robbiemoto.com'
