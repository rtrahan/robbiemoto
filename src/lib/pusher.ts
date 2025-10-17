import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  }
)

// Channel names
export const CHANNELS = {
  auction: (auctionId: string) => `auction-${auctionId}`,
  lot: (lotId: string) => `lot-${lotId}`,
  user: (userId: string) => `private-user-${userId}`,
}

// Event names
export const EVENTS = {
  NEW_BID: 'new-bid',
  AUCTION_STARTED: 'auction-started',
  AUCTION_ENDED: 'auction-ended',
  AUCTION_EXTENDED: 'auction-extended',
  OUTBID: 'outbid',
  RESERVE_MET: 'reserve-met',
}
