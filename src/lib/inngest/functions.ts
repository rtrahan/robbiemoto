import { inngest } from './client'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher'
import { WinnerEmail } from '@/emails/winner-email'
import { OutbidEmail } from '@/emails/outbid-email'
import { calculateOrderTotal } from '@/lib/helpers'

// Check auction status and trigger events
export const checkAuctionStatus = inngest.createFunction(
  {
    id: 'check-auction-status',
    name: 'Check Auction Status',
  },
  { cron: '* * * * *' }, // Run every minute
  async ({ event, step }) => {
    const now = new Date()
    
    // Find auctions that should start
    const auctionsToStart = await step.run('find-auctions-to-start', async () => {
      return prisma.auction.findMany({
        where: {
          status: 'PREVIEW',
          startsAt: { lte: now },
          published: true,
        },
      })
    })
    
    // Start auctions
    for (const auction of auctionsToStart) {
      await step.run(`start-auction-${auction.id}`, async () => {
        await prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'LIVE' },
        })
        
        // Broadcast auction started event
        await pusherServer.trigger(
          CHANNELS.auction(auction.id),
          EVENTS.AUCTION_STARTED,
          { auctionId: auction.id }
        )
        
        console.log(`Auction ${auction.id} started`)
      })
    }
    
    // Find auctions that should end
    const auctionsToEnd = await step.run('find-auctions-to-end', async () => {
      return prisma.auction.findMany({
        where: {
          status: 'LIVE',
          endsAt: { lte: now },
        },
        include: {
          lots: {
            include: {
              bids: {
                where: { isLeading: true },
                include: {
                  user: true,
                },
              },
            },
          },
        },
      })
    })
    
    // End auctions and trigger settlement
    for (const auction of auctionsToEnd) {
      await step.run(`end-auction-${auction.id}`, async () => {
        await prisma.auction.update({
          where: { id: auction.id },
          data: { 
            status: 'ENDED',
            actualEndedAt: now,
          },
        })
        
        // Broadcast auction ended event
        await pusherServer.trigger(
          CHANNELS.auction(auction.id),
          EVENTS.AUCTION_ENDED,
          { auctionId: auction.id }
        )
        
        console.log(`Auction ${auction.id} ended`)
        
        // Trigger settlement for each lot
        for (const lot of auction.lots) {
          if (lot.bids.length > 0 && lot.bids[0]) {
            await inngest.send({
              name: 'auction/lot.won',
              data: {
                lotId: lot.id,
                winnerId: lot.bids[0].user.id,
                winningBidId: lot.bids[0].id,
                amountCents: lot.bids[0].amountCents,
              },
            })
          }
        }
      })
    }
    
    return {
      started: auctionsToStart.length,
      ended: auctionsToEnd.length,
    }
  }
)

// Handle lot won - create order and charge payment
export const handleLotWon = inngest.createFunction(
  {
    id: 'handle-lot-won',
    name: 'Handle Lot Won',
  },
  { event: 'auction/lot.won' },
  async ({ event, step }) => {
    const { lotId, winnerId, winningBidId, amountCents } = event.data
    
    // Get lot and winner details
    const [lot, winner] = await step.run('get-lot-and-winner', async () => {
      return Promise.all([
        prisma.lot.findUnique({
          where: { id: lotId },
          include: { auction: true },
        }),
        prisma.user.findUnique({
          where: { id: winnerId },
          include: {
            paymentMethods: {
              where: { isDefault: true },
              take: 1,
            },
          },
        }),
      ])
    })
    
    if (!lot || !winner) {
      throw new Error('Lot or winner not found')
    }
    
    // Calculate order total
    const { subtotal, shipping, tax, total } = calculateOrderTotal(
      amountCents,
      899, // $8.99 shipping
      0 // TODO: Get tax rate from settings
    )
    
    // Create order
    const order = await step.run('create-order', async () => {
      return prisma.order.create({
        data: {
          userId: winnerId,
          lotId,
          finalPriceCents: amountCents,
          shippingCents: shipping,
          taxCents: tax,
          totalCents: total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      })
    })
    
    // Update lot as sold
    await step.run('mark-lot-sold', async () => {
      await prisma.lot.update({
        where: { id: lotId },
        data: { sold: true },
      })
      
      // Update winning bid status
      await prisma.bid.update({
        where: { id: winningBidId },
        data: { status: 'WON' },
      })
    })
    
    // Charge payment
    if (winner.paymentMethods.length > 0 && winner.stripeCustomerId) {
      const paymentResult = await step.run('charge-payment', async () => {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'usd',
            customer: winner.stripeCustomerId!,
            payment_method: winner.paymentMethods[0].stripePaymentMethodId,
            off_session: true,
            confirm: true,
            metadata: {
              orderId: order.id,
              lotId,
              userId: winnerId,
            },
            description: `Payment for ${lot.title}`,
          })
          
          // Update order with payment intent
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentIntentId: paymentIntent.id,
              paymentStatus: paymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'PROCESSING',
              paidAt: paymentIntent.status === 'succeeded' ? new Date() : null,
              status: paymentIntent.status === 'succeeded' ? 'PAID' : 'PROCESSING',
            },
          })
          
          return { success: true, paymentIntentId: paymentIntent.id }
        } catch (error) {
          console.error('Payment failed:', error)
          
          // Update order status
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
            },
          })
          
          return { success: false, error: error instanceof Error ? error.message : 'Payment failed' }
        }
      })
      
      // Send winner email
      await step.run('send-winner-email', async () => {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: winner.email,
          subject: `Congratulations! You won ${lot.title}`,
          react: WinnerEmail({
            userName: winner.name || winner.email,
            lotTitle: lot.title,
            winningBid: `$${(amountCents / 100).toFixed(2)}`,
            shipping: `$${(shipping / 100).toFixed(2)}`,
            tax: `$${(tax / 100).toFixed(2)}`,
            total: `$${(total / 100).toFixed(2)}`,
            orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`,
          }),
        })
      })
      
      return { orderId: order.id, paymentResult }
    }
    
    return { orderId: order.id, paymentSkipped: true }
  }
)

// Send outbid notification
export const sendOutbidNotification = inngest.createFunction(
  {
    id: 'send-outbid-notification',
    name: 'Send Outbid Notification',
  },
  { event: 'auction/bid.outbid' },
  async ({ event, step }) => {
    const { userId, lotId, newBidAmount } = event.data
    
    // Get user and lot details
    const [user, lot] = await step.run('get-user-and-lot', async () => {
      return Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.lot.findUnique({
          where: { id: lotId },
          include: { auction: true },
        }),
      ])
    })
    
    if (!user || !lot) {
      throw new Error('User or lot not found')
    }
    
    // Calculate next minimum bid
    const nextMinBid = newBidAmount + (lot.auction.fixedIncrementCents || 500)
    
    // Send outbid email
    await step.run('send-email', async () => {
      const timeUntilEnd = lot.auction.endsAt.getTime() - Date.now()
      const hoursRemaining = Math.floor(timeUntilEnd / (1000 * 60 * 60))
      const minutesRemaining = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60))
      
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `You've been outbid on ${lot.title}`,
        react: OutbidEmail({
          userName: user.name || user.email,
          lotTitle: lot.title,
          currentBid: `$${(newBidAmount / 100).toFixed(2)}`,
          newMinBid: `$${(nextMinBid / 100).toFixed(2)}`,
          lotUrl: `${process.env.NEXT_PUBLIC_APP_URL}/lot/${lot.slug}`,
          auctionEndsAt: hoursRemaining > 0 
            ? `in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`
            : `in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`,
        }),
      })
    })
    
    // Create notification record
    await step.run('create-notification', async () => {
      await prisma.notification.create({
        data: {
          userId,
          type: 'OUTBID',
          channel: 'EMAIL',
          subject: `You've been outbid on ${lot.title}`,
          message: `Someone placed a higher bid of $${(newBidAmount / 100).toFixed(2)} on ${lot.title}`,
          metadata: { lotId, newBidAmount },
          sent: true,
          sentAt: new Date(),
        },
      })
    })
    
    return { notified: user.email }
  }
)
