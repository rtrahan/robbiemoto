import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@robbiemoto.com'
export const REPLY_TO_EMAIL = 'support@robbiemoto.com'
