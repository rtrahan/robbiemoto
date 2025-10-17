import { PrismaClient, AuctionStatus, BidStatus, MediaType, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...')
  await prisma.bid.deleteMany()
  await prisma.media.deleteMany()
  await prisma.order.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.lot.deleteMany()
  await prisma.auction.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.signup.deleteMany()
  await prisma.settings.deleteMany()

  // Create settings
  console.log('⚙️  Creating settings...')
  await prisma.settings.create({
    data: {
      id: 'default',
      shippingFlatRateCents: 899, // $8.99
      taxEnabled: true,
      taxRate: 0.0, // 0% for now
      emailOutbidEnabled: true,
      smsOutbidEnabled: false,
      videoEnabled: true,
      videoMaxSeconds: 20,
      videoMaxMB: 25,
    },
  })

  // Create demo users
  console.log('👥 Creating demo users...')
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'demo_admin',
      email: 'admin@robbiemoto.com',
      name: 'Admin User',
      alias: 'Admin',
      role: UserRole.ADMIN,
    },
  })

  const user1 = await prisma.user.create({
    data: {
      clerkId: 'demo_user1',
      email: 'collector1@example.com',
      name: 'Sarah Johnson',
      alias: 'potter_fan_42',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      clerkId: 'demo_user2',
      email: 'collector2@example.com',
      name: 'Mike Chen',
      alias: 'mug_collector',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      clerkId: 'demo_user3',
      email: 'collector3@example.com',
      name: 'Emma Davis',
      alias: 'craft_lover',
    },
  })

  console.log('✅ Created users:', { adminUser: adminUser.email, user1: user1.email })

  // Create auctions
  console.log('🏺 Creating auctions...')

  const now = new Date()
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const recentPastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

  // Past completed auction
  const winterAuction = await prisma.auction.create({
    data: {
      slug: 'winter-collection-2024',
      name: 'Winter Collection 2024',
      description: 'Cozy winter-themed mugs and pottery featuring deep blues, warm browns, and earthy glazes.',
      status: AuctionStatus.ENDED,
      startsAt: pastDate,
      endsAt: recentPastDate,
      actualEndedAt: recentPastDate,
      published: true,
      featured: false,
    },
  })

  // Create lots for winter auction
  const winterLot1 = await prisma.lot.create({
    data: {
      auctionId: winterAuction.id,
      slug: 'midnight-blue-mug-winter',
      title: 'Midnight Blue Ceramic Mug',
      description: 'A deep blue glaze reminiscent of winter nights. Wheel-thrown and hand-carved with a cozy grip. Holds 12oz perfectly.',
      condition: 'New - Handmade',
      dimensions: '4" tall x 3.5" diameter',
      materials: 'Stoneware clay, food-safe glaze',
      startingBidCents: 3500,
      reserveCents: 8000,
      currentBidCents: 12500,
      published: true,
      sold: true,
      reserveMet: true,
      sortOrder: 1,
      featured: true,
    },
  })

  const winterLot2 = await prisma.lot.create({
    data: {
      auctionId: winterAuction.id,
      slug: 'forest-green-set-winter',
      title: 'Forest Green Mug & Bowl Set',
      description: 'Matching set with rich forest green glaze. Both pieces feature hand-carved pine needle details.',
      condition: 'New - Handmade',
      dimensions: 'Mug: 4" tall, Bowl: 5" diameter',
      materials: 'Stoneware clay, food-safe glaze',
      startingBidCents: 5000,
      reserveCents: 12000,
      currentBidCents: 15000,
      published: true,
      sold: true,
      reserveMet: true,
      sortOrder: 2,
    },
  })

  // Add bids for completed auction
  await prisma.bid.create({
    data: {
      lotId: winterLot1.id,
      userId: user1.id,
      amountCents: 3500,
      status: BidStatus.OUTBID,
      isLeading: false,
      placedAt: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000),
    },
  })

  await prisma.bid.create({
    data: {
      lotId: winterLot1.id,
      userId: user2.id,
      amountCents: 8500,
      status: BidStatus.OUTBID,
      isLeading: false,
      placedAt: new Date(pastDate.getTime() + 5 * 60 * 60 * 1000),
    },
  })

  await prisma.bid.create({
    data: {
      lotId: winterLot1.id,
      userId: user3.id,
      amountCents: 12500,
      status: BidStatus.WON,
      isLeading: true,
      placedAt: new Date(pastDate.getTime() + 8 * 60 * 60 * 1000),
    },
  })

  // Upcoming auction
  const springAuction = await prisma.auction.create({
    data: {
      slug: 'spring-awakening-2025',
      name: 'Spring Awakening 2025',
      description: 'Fresh spring colors meet organic forms. Featuring cherry blossom pinks, sage greens, and soft yellows in this seasons collection.',
      status: AuctionStatus.PREVIEW,
      startsAt: futureDate,
      endsAt: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      published: true,
      featured: true,
    },
  })

  // Create lots for spring auction
  const springLots = [
    {
      slug: 'cherry-blossom-mug',
      title: 'Cherry Blossom Mug',
      description: 'Delicate pink and white glaze with hand-carved cherry blossom petals. A celebration of spring in every sip. Perfect for morning tea.',
      condition: 'New - Handmade',
      dimensions: '3.5" tall x 3" diameter',
      materials: 'Porcelain, food-safe glaze',
      startingBidCents: 4000,
      reserveCents: 10000,
      buyNowCents: 25000,
      featured: true,
      sortOrder: 1,
    },
    {
      slug: 'sage-green-coffee-mug',
      title: 'Sage Green Coffee Mug',
      description: 'Earthy sage green with a smooth matte finish. Ergonomic handle for comfortable morning coffee. Holds 14oz.',
      condition: 'New - Handmade',
      dimensions: '4.5" tall x 3.5" diameter',
      materials: 'Stoneware clay, matte glaze',
      startingBidCents: 3500,
      reserveCents: 9000,
      buyNowCents: 22000,
      featured: true,
      sortOrder: 2,
    },
    {
      slug: 'sunrise-yellow-mug',
      title: 'Sunrise Yellow Mug',
      description: 'Bright and cheerful yellow glaze that radiates warmth. Hand-thrown with a comfortable grip. Makes every morning brighter.',
      condition: 'New - Handmade',
      dimensions: '4" tall x 3.25" diameter',
      materials: 'Stoneware clay, glossy glaze',
      startingBidCents: 3500,
      reserveCents: 8500,
      featured: false,
      sortOrder: 3,
    },
    {
      slug: 'wildflower-meadow-set',
      title: 'Wildflower Meadow Mug Set (2pc)',
      description: 'Pair of mugs featuring hand-painted wildflower details on a cream base. Each one unique with natural variations.',
      condition: 'New - Handmade',
      dimensions: 'Each: 4" tall x 3.5" diameter',
      materials: 'Stoneware clay, hand-painted underglazes',
      startingBidCents: 6000,
      reserveCents: 15000,
      buyNowCents: 35000,
      featured: false,
      sortOrder: 4,
    },
    {
      slug: 'leather-journal-cover',
      title: 'Hand-Stitched Leather Journal Cover',
      description: 'Premium vegetable-tanned leather journal cover with hand-stitching. Fits standard 5x8" notebooks. Ages beautifully with use.',
      condition: 'New - Handmade',
      dimensions: '5.5" x 8.5"',
      materials: 'Vegetable-tanned leather, waxed thread',
      startingBidCents: 4500,
      reserveCents: 12000,
      featured: false,
      sortOrder: 5,
    },
    {
      slug: 'minimalist-white-mug',
      title: 'Minimalist White Mug',
      description: 'Pure white glaze with clean lines. Simple, elegant, timeless. The perfect canvas for your morning ritual.',
      condition: 'New - Handmade',
      dimensions: '3.75" tall x 3.5" diameter',
      materials: 'Porcelain, white glaze',
      startingBidCents: 3000,
      reserveCents: 7500,
      featured: false,
      sortOrder: 6,
    },
  ]

  for (const lotData of springLots) {
    await prisma.lot.create({
      data: {
        ...lotData,
        auctionId: springAuction.id,
        published: true,
      },
    })
  }

  // Recent live auction (for testing)
  const currentAuction = await prisma.auction.create({
    data: {
      slug: 'artisan-essentials-march',
      name: 'Artisan Essentials - March Drop',
      description: 'A curated selection of everyday essentials made extraordinary. Featuring bold glazes and experimental forms.',
      status: AuctionStatus.LIVE,
      startsAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endsAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Ends in 1 day
      published: true,
      featured: true,
    },
  })

  const liveL1 = await prisma.lot.create({
    data: {
      auctionId: currentAuction.id,
      slug: 'cobalt-blue-statement-mug',
      title: 'Cobalt Blue Statement Mug',
      description: 'Bold cobalt blue glaze that makes a statement. Oversized design holds 16oz. Perfect for the coffee enthusiast.',
      condition: 'New - Handmade',
      dimensions: '5" tall x 4" diameter',
      materials: 'Stoneware clay, cobalt glaze',
      startingBidCents: 4000,
      reserveCents: 10000,
      currentBidCents: 8500,
      published: true,
      reserveMet: false,
      sortOrder: 1,
      featured: true,
    },
  })

  const liveL2 = await prisma.lot.create({
    data: {
      auctionId: currentAuction.id,
      slug: 'rustic-brown-mug',
      title: 'Rustic Brown Mug',
      description: 'Earthy brown with iron speckles throughout. Raw, natural, grounding. Every sip connects you to the earth.',
      condition: 'New - Handmade',
      dimensions: '4" tall x 3.5" diameter',
      materials: 'Stoneware with iron oxide, natural glaze',
      startingBidCents: 3500,
      reserveCents: 9000,
      currentBidCents: 12000,
      published: true,
      reserveMet: true,
      sortOrder: 2,
      featured: true,
    },
  })

  // Add active bids to live auction
  await prisma.bid.create({
    data: {
      lotId: liveL1.id,
      userId: user1.id,
      amountCents: 4000,
      status: BidStatus.OUTBID,
      isLeading: false,
      placedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  })

  await prisma.bid.create({
    data: {
      lotId: liveL1.id,
      userId: user2.id,
      amountCents: 8500,
      isProxy: true,
      maxProxyCents: 15000,
      status: BidStatus.LEADING,
      isLeading: true,
      placedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
  })

  await prisma.bid.create({
    data: {
      lotId: liveL2.id,
      userId: user3.id,
      amountCents: 3500,
      status: BidStatus.OUTBID,
      isLeading: false,
      placedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    },
  })

  await prisma.bid.create({
    data: {
      lotId: liveL2.id,
      userId: user1.id,
      amountCents: 12000,
      status: BidStatus.LEADING,
      isLeading: true,
      placedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
  })

  // Create some waitlist signups
  console.log('📧 Creating waitlist signups...')
  await prisma.signup.createMany({
    data: [
      {
        email: 'collector1@example.com',
        confirmed: true,
        confirmedAt: new Date(),
      },
      {
        email: 'pottery_lover@example.com',
        confirmed: true,
        confirmedAt: new Date(),
      },
      {
        email: 'newcollector@example.com',
        confirmed: false,
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Created ${await prisma.user.count()} users`)
  console.log(`- Created ${await prisma.auction.count()} auctions`)
  console.log(`- Created ${await prisma.lot.count()} lots`)
  console.log(`- Created ${await prisma.bid.count()} bids`)
  console.log(`- Created ${await prisma.signup.count()} waitlist signups`)
  console.log('\n🎯 You can now:')
  console.log('- Browse auctions at /auctions')
  console.log('- View upcoming Spring auction at /auction/spring-awakening-2025')
  console.log('- Check live auction at /auction/artisan-essentials-march')
  console.log('- Access admin panel at /admin (use admin@robbiemoto.com user)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
