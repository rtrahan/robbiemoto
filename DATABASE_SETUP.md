# Setting Up Real Database (Supabase)

## Why You Need a Database

Right now, the app works in "demo mode" with mock data. To actually:
- ✅ Save auctions and items
- ✅ Track real bids
- ✅ Persist data between restarts
- ✅ Have real functionality

You need a database! Supabase is the easiest option.

---

## Option 1: Supabase (Recommended - 5 minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (easiest)

### Step 2: Create a New Project

1. Click "New Project"
2. Choose:
   - **Name**: `robbiemugs` (or whatever you want)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., US East)
   - **Pricing Plan**: Free tier (perfect for starting)
3. Click "Create new project"
4. Wait ~2 minutes for setup

### Step 3: Get Your Database URL

1. In your Supabase project dashboard
2. Click "Project Settings" (gear icon in sidebar)
3. Click "Database" in the left menu
4. Scroll to "Connection string"
5. Select "URI" tab
6. Copy the connection string
7. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
8. **Important**: Replace `[YOUR-PASSWORD]` with the password you created!

### Step 4: Add to Your Project

Open `.env.local` and update:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

### Step 5: Initialize Database

Run these commands:

```bash
# Push the database schema to Supabase
npm run db:push

# Seed with sample data (2 auctions + 12 items)
npm run db:seed
```

### Step 6: Restart Server

```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

### Step 7: Test It!

1. Go to `/admin-login` and login
2. You should now see REAL auctions from the database
3. Edit an auction and add items - they'll actually save!
4. Refresh the page - data persists!

---

## Option 2: Neon (Alternative)

If you prefer Neon:

1. Go to https://neon.tech
2. Sign up
3. Create project
4. Copy connection string
5. Add to `.env.local`
6. Run `npm run db:push` and `npm run db:seed`

---

## Option 3: Local PostgreSQL (Advanced)

If you want to run PostgreSQL locally:

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16
createdb robbiemugs

# Add to .env.local:
DATABASE_URL="postgresql://localhost:5432/robbiemugs"

# Then:
npm run db:push
npm run db:seed
```

---

## What Happens After Database Setup

### Before (Demo Mode):
- Mock data only
- Nothing persists
- Can't actually create/edit/delete

### After (Real Database):
- All data persists
- Create real auctions
- Add real items
- Track real bids (when you add auth later)
- Full functionality

---

## Verifying It's Working

After setup, check:

```bash
# Open Prisma Studio to view your data
npm run db:studio
```

This opens a GUI at `http://localhost:5555` where you can see all your database tables and data!

---

## What You Get with Database

✅ **Auctions Table**: All your monthly auctions  
✅ **Lots Table**: All ceramic items (~12 per auction)  
✅ **Bids Table**: Bidding history (when you add auth)  
✅ **Users Table**: User accounts (when you add Clerk)  
✅ **Settings Table**: Global settings  

---

## Cost

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ Unlimited API requests
- ✅ 2GB bandwidth
- ✅ Perfect for your use case!

For a monthly auction with ~12 items, you'll use maybe 1-2 MB total. The free tier will last you years!

---

## Need Help?

If you get stuck:
1. Make sure password in DATABASE_URL is correct
2. Make sure you replaced `[YOUR-PASSWORD]` placeholder
3. Check Supabase project is "Active" (not paused)
4. Try connection from Supabase dashboard first

---

**Once set up, your auction platform will be FULLY functional!** 🎉


