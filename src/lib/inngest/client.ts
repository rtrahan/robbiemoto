import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'robbiemoto-auctions',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
