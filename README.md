# 🏺 Robbiemoto Auction Platform

A modern, real-time auction platform for handcrafted ceramics and mugs, built with Next.js 15, Supabase, and OpenAI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🎨 For Collectors
- **Real-time bidding** with live updates and bid history
- **Responsive design** optimized for mobile and desktop
- **Video & image galleries** with carousel navigation
- **User profiles** with bid history and preferences
- **Email notifications** for outbid alerts and auction updates
- **Secure authentication** via Supabase Auth

### 🛠️ For Admins
- **AI-powered descriptions** using GPT-4o Vision
- **Drag & drop** image/video uploads to Supabase Storage
- **Live auction management** with automatic status detection
- **Comprehensive dashboard** with real-time metrics
- **Bid history viewer** to track all bids and bidders
- **Batch operations** for efficient auction creation

### 🚀 Technical Highlights
- **Real-time updates** with automatic bid refresh
- **Smart auction states** (Preview → Live → Ended)
- **Soft close** anti-sniping with time extensions
- **Reserve prices** with hidden minimums
- **PostgreSQL** database with Prisma ORM
- **Serverless API** routes for scalability

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (images/videos)
- **AI**: OpenAI GPT-4o (Vision & Text)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (for AI descriptions)
- PostgreSQL database

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/rtrahan/robbiemoto.git
cd robbiemoto
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Database
DATABASE_URL="your_supabase_postgres_url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# OpenAI (for AI descriptions)
OPENAI_API_KEY="sk-..."
```

### 3. Database Setup

```bash
# Push Prisma schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Create Admin Account

In Supabase Dashboard → Authentication → Users:
1. Click "Add user" → "Create new user"
2. Email: `admin@robbiemoto.com`
3. Password: Your choice
4. Auto Confirm User: ✅ Yes
5. Click "Create user"

Then run this SQL in Supabase SQL Editor:

```sql
INSERT INTO "User" ("clerkId", "email", "name", "alias", "role")
VALUES (
  'PASTE_SUPABASE_USER_ID_HERE',
  'admin@robbiemoto.com',
  'Admin',
  'Admin',
  'ADMIN'
);
```

### 5. Configure Supabase Storage

In Supabase Dashboard → Storage:
1. Create bucket named `auction-media`
2. Set to **Public**
3. Configure CORS (Settings → CORS):

```json
[
  {
    "origin": "*",
    "methods": ["GET", "HEAD"],
    "maxAge": 3600
  }
]
```

### 6. Run Development Server

```bash
npm run dev
```

Visit:
- **Public Auction**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (login with admin account)

## 📚 Key Features

### Real-Time Bidding
- Automatic bid refresh every 2 seconds
- Visual feedback for new bids (yellow flash)
- Bid history modal with full bidder details
- Soft close: 2-minute window with 2-minute extensions

### AI-Powered Descriptions
- Upload images → AI generates title, condition, and description
- Supports multiple images per item
- Filters out HEIC/unsupported formats
- Batch generate auction descriptions from all items

### Admin Dashboard
- Live auction status (calculated from dates)
- Total bids and current bid values
- User registration metrics
- Recent auctions sorted by priority (Live → Preview → Ended)

### User Management
- Supabase Auth for secure authentication
- Profile editing with name/email updates
- Bid history tracking
- Email preference management

## 🗂️ Project Structure

```
robbiemoto/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── admin/             # Admin panel
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin APIs
│   │   │   ├── ai/            # AI generation
│   │   │   ├── bids/          # Bidding system
│   │   │   └── user/          # User management
│   │   ├── profile/           # User profile
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Feature components
│   └── lib/
│       ├── prisma.ts          # Database client
│       ├── supabase-auth.ts   # Auth helpers
│       └── auction-helpers.ts # Auction logic
└── public/                    # Static assets
```

## 🎯 Usage

### Creating an Auction

1. Go to Admin Dashboard → "New Auction"
2. Fill in auction details (name, dates, description)
3. Click "Save Auction"
4. Add items with photos/videos
5. Use "Generate with AI" for automatic descriptions
6. Publish when ready!

### Managing Bids

- Click "🔨 X bids" badge on any item to see full bid history
- View bidder names, emails, amounts, and timestamps
- Leading bid highlighted in green with trophy icon

### User Authentication

- Users sign up with name (shown in bid history)
- Admin users (`admin@robbiemoto.com`) auto-redirect to admin panel
- Regular users go to auction homepage

## 🔒 Security

- Row Level Security (RLS) on Supabase
- Server-side authentication with Bearer tokens
- Admin routes protected by cookie-based auth
- Environment variables for sensitive keys

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub (already done! ✅)
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT License - feel free to use for your own auction projects!

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database & Auth by [Supabase](https://supabase.com/)
- AI by [OpenAI](https://openai.com/)

---

**Made with ❤️ for handcrafted ceramics** 🏺
