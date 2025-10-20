# Robbiemoto Auctions - Setup Guide

This guide will help you get the Robbiemoto auction platform up and running locally.

## Table of Contents

- [Quick Start (Demo Mode)](#quick-start-demo-mode)
- [Full Setup (Production-Ready)](#full-setup-production-ready)
- [Database Setup](#database-setup)
- [Service Configuration](#service-configuration)
- [Development Tips](#development-tips)

---

## Quick Start (Demo Mode)

Get the app running in 5 minutes without external services:

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

That's it! The app will run at `http://localhost:3000` with mock data.

**What works in demo mode:**
- ✅ Browse auctions and lots
- ✅ View auction details
- ✅ Admin panel access
- ✅ All UI components

**What doesn't work:**
- ❌ Authentication (requires Clerk)
- ❌ Real bidding (requires database)
- ❌ Payment processing (requires Stripe)
- ❌ Email notifications (requires Resend)

---

## Full Setup (Production-Ready)

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend [Neon](https://neon.tech) - free tier available)
- Accounts for the following services:
  - [Clerk](https://clerk.com) - Authentication (free tier)
  - [Stripe](https://stripe.com) - Payments (test mode available)
  - [Pusher](https://pusher.com) - Real-time updates (free tier)
  - [Resend](https://resend.com) - Email notifications (free tier)
  - [UploadThing](https://uploadthing.com) - File uploads (free tier)
  - [Inngest](https://inngest.com) - Background jobs (free tier)

### Step-by-Step Setup

#### 1. Clone and Install

```bash
git clone <your-repo>
cd robbiemugs
npm install
```

#### 2. Set Up Database

**Option A: Neon (Recommended)**

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. It will look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb robbiemugs
```

Your connection string: `postgresql://localhost:5432/robbiemugs`

#### 3. Configure Environment

```bash
# Copy the example env file
cp env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL="postgresql://..."  # Your Neon or local connection string

# Clerk Authentication
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe Payments
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Get after setting up webhooks

# Pusher Real-time
# Get these from https://dashboard.pusher.com
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="us2"  # or your cluster
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# Resend Email
# Get from https://resend.com/api-keys
RESEND_API_KEY="re_..."

# UploadThing File Uploads
# Get from https://uploadthing.com/dashboard
UPLOADTHING_TOKEN="..."

# Inngest Background Jobs
# Get from https://inngest.com
INNGEST_APP_ID="..."
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

#### 4. Initialize Database

```bash
# Push the schema to your database
npm run db:push

# Seed with sample data
npm run db:seed
```

This creates:
- 4 demo users (including admin@robbiemoto.com)
- 3 auctions (past, current, upcoming)
- Multiple lots with realistic data
- Sample bids and activity

#### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

#### 6. Access Admin Panel

1. Go to `http://localhost:3000/admin`
2. In demo mode, admin access is open
3. For production, you'll need to set up Clerk authentication

---

## Database Setup

### Available Commands

```bash
# Push schema changes (development)
npm run db:push

# Create migrations (production)
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Prisma Studio

Prisma Studio is a visual database editor:

```bash
npm run db:studio
```

Opens at `http://localhost:5555` - you can view and edit all your data.

---

## Service Configuration

### Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Under "Email, Phone, Username", enable Email
4. Under "API Keys", copy your keys
5. Add to `.env.local`

**Setting Admin Role:**
1. Sign up for an account in your app
2. Open Prisma Studio: `npm run db:studio`
3. Find your user in the `User` table
4. Change `role` from `USER` to `ADMIN`
5. Refresh your app - you'll now see admin navigation

### Stripe Payments

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test keys from [API Keys](https://dashboard.stripe.com/test/apikeys)
3. Add to `.env.local`

**Setting up Webhooks:**
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Run: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret to `.env.local`

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### Pusher Real-time

1. Go to [Pusher Dashboard](https://dashboard.pusher.com)
2. Create new app or channel
3. Copy credentials to `.env.local`
4. Make sure cluster matches (e.g., `us2`, `eu`, `ap1`)

### Resend Email

1. Go to [Resend](https://resend.com)
2. Get API key
3. Add to `.env.local`
4. Verify your sending domain (or use test mode)

---

## Development Tips

### Hot Reload

The dev server uses Turbopack for fast hot module replacement. Save any file and see changes instantly.

### Debugging

```bash
# View server logs
npm run dev

# Check database
npm run db:studio

# View Inngest jobs
# Visit inngest.com dashboard
```

### Reset Database

```bash
# Clear all data and reseed
npm run db:push -- --force-reset
npm run db:seed
```

### Common Issues

**"Can't reach database server"**
- Check your `DATABASE_URL` is correct
- Make sure database is running (for local PostgreSQL)
- Verify Neon project isn't suspended

**Clerk authentication errors**
- Verify keys are correct and start with `pk_` and `sk_`
- Clear browser cache and try incognito mode
- Check keys match your environment (test vs production)

**Stripe payment issues**
- Confirm you're using test keys (start with `sk_test_`)
- Set up webhook endpoint correctly
- Check Stripe dashboard logs for errors

### Environment Variables

Required for full functionality:
- `DATABASE_URL` - Database connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth
- `CLERK_SECRET_KEY` - Clerk auth
- `STRIPE_SECRET_KEY` - Payments
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Payments

Optional (use defaults if not set):
- All others provide enhanced features but aren't required

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Connect to your Neon database
- Set up preview deployments

### Database Migrations

For production, use migrations instead of `db:push`:

```bash
# Create migration
npm run db:migrate

# Deploy migration
npm run db:migrate -- --skip-seed
```

### Monitoring

- Vercel Dashboard for deployment status
- Neon Console for database metrics
- Stripe Dashboard for payment logs
- Inngest Dashboard for background jobs

---

## Support

Need help? Check:
- [Product Spec](./PRODUCT_SPEC.md) - Detailed feature documentation
- [README](./README.md) - Project overview
- GitHub Issues - Known issues and solutions

---

**Happy building! 🏺**


