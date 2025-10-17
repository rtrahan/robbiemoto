# Vercel Database Connection Fix

## Problem
Vercel can't connect to Supabase database - getting "Can't reach database server" errors.

## Solution

### Option 1: Use Supabase's Transaction Pooler (Recommended)

In **Vercel Environment Variables**, update `DATABASE_URL` to:

```
postgresql://postgres.bdyuqcxtdawxhhdxgkic:xajgym-5Zyhvo-pygzek@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Format breakdown:**
- Host: `postgres.PROJECT_REF` (not `db.PROJECT_REF`)
- Domain: `aws-0-us-east-1.pooler.supabase.com`
- Port: `6543`
- Add: `?pgbouncer=true`

### Option 2: Use Direct Connection with SSL

If pooler doesn't work, use direct connection:

```
postgresql://postgres:xajgym-5Zyhvo-pygzek@db.bdyuqcxtdawxhhdxgkic.supabase.co:5432/postgres?sslmode=require
```

### Option 3: Get the Exact Pooler URL from Supabase

1. Go to **Supabase Dashboard**
2. Go to **Project Settings** → **Database**
3. Scroll to **Connection string**
4. Select **"Transaction" mode** (for Prisma)
5. Copy the **full connection string**
6. Paste it into Vercel's `DATABASE_URL`

## Prisma Configuration

Also update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

Then in Vercel, add:
- `DATABASE_URL` = Transaction pooler (port 6543)
- `DIRECT_URL` = Direct connection (port 5432) - optional, for migrations

## After Updating

1. Save environment variables
2. Redeploy
3. Check logs - should see successful database connections!

