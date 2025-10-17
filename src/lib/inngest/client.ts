import { Inngest } from 'inngest'

// Make Inngest optional - only initialize if event key is present
export const inngest = process.env.INNGEST_EVENT_KEY
  ? new Inngest({
      id: 'robbiemoto-auctions',
      eventKey: process.env.INNGEST_EVENT_KEY,
    })
  : new Inngest({ id: 'robbiemoto-auctions' }) // Minimal config for build
