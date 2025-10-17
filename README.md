# Robbiemoto Auctions

A modern auction platform for handcrafted mugs and leather goods, built with Next.js, TypeScript, and real-time bidding.

## Features

- 🏺 **Monthly Auctions** - Scheduled drops for one-of-a-kind handcrafted items
- 💳 **Secure Payments** - Stripe integration with auto-charge on winning
- ⚡ **Real-time Bidding** - Live updates via Pusher
- 📧 **Email Notifications** - Outbid alerts and order confirmations
- 🎯 **Proxy Bidding** - Automatic bid increments up to your max
- ⏱️ **Soft-Close** - 2-minute extensions to prevent sniping
- 📱 **Responsive Design** - Beautiful on all devices
- 🔐 **Secure Auth** - Magic link authentication via Clerk
- 👨‍💼 **Admin Dashboard** - Complete auction management

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Real-time**: Pusher
- **Email**: Resend + React Email
- **File Uploads**: UploadThing
- **Background Jobs**: Inngest
- **Hosting**: Vercel

## Getting Started

### Quick Start (5 minutes)

Run the automated setup script:

```bash
# Clone the repository
git clone <your-repo>
cd robbiemugs

# Run setup script
./scripts/setup.sh

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

The app will run in demo mode with mock data. For full functionality with authentication and real bidding, see [SETUP.md](./SETUP.md).

### What's Included

After running the setup script, you'll have:

✅ **Demo Auctions** - 3 auctions (past, current, upcoming)  
✅ **Sample Lots** - Realistic handcrafted mug listings  
✅ **Bid History** - Example bidding activity  
✅ **Admin Panel** - Full auction management UI at `/admin`  
✅ **All Pages** - Browse, search, and view all features

### Manual Setup

If you prefer manual setup or need production configuration:

1. **Install dependencies:**
```bash
npm install
```

2. **Copy environment file:**
```bash
cp env.example .env.local
```

3. **Set up database** (optional for demo mode):
```bash
# Add DATABASE_URL to .env.local, then:
npm run db:push     # Create tables
npm run db:seed     # Add sample data
```

4. **Start dev server:**
```bash
npm run dev
```

**For detailed configuration, see [SETUP.md](./SETUP.md)**

### Admin Access

To access the admin panel:

1. Go to http://localhost:3000/admin-login
2. Use demo credentials:
   - **Email:** `admin@robbiemoto.com`
   - **Password:** `admin123`
3. After login, you'll have full access to:
   - Create and manage auctions
   - Add and edit lots
   - View bidding activity
   - Manage orders

The admin session lasts 7 days. Click "Logout" in the admin header to end your session.

## Database Management

```bash
# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database (if seed file exists)
npm run db:seed
```

## Project Structure

```
robbiemugs/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── account/      # User account pages
│   │   ├── auction/      # Auction pages
│   │   ├── lot/          # Individual lot pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── admin/        # Admin components
│   │   ├── auction/      # Auction components
│   │   ├── lot/          # Lot components
│   │   └── landing/      # Landing page components
│   ├── lib/              # Utility functions and configs
│   │   └── inngest/      # Background job functions
│   └── emails/           # Email templates
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Auction Configuration

Default auction settings (can be modified in admin):
- **Bid Increment**: $5.00 fixed
- **Soft-Close Window**: 2 minutes
- **Soft-Close Extension**: 2 minutes
- **Shipping**: $8.99 flat rate (US only)
- **Payment**: Auto-charge on auction close

## Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

## Background Jobs

Inngest functions run automatically to:
- Check auction start/end times (every minute)
- Process winning bids and create orders
- Send email notifications
- Handle payment processing

Access Inngest dashboard to monitor jobs.

## Support

For issues or questions, please open a GitHub issue.

## License

All rights reserved. This is proprietary software for Robbiemoto.

---

Built with ❤️ for handcrafted goods