# Quick Start Guide - Robbiemoto Auctions

## 🏺 Simple Monthly Ceramic Auctions

This platform is designed for one thing: running monthly auctions for ~12 handcrafted ceramic items.

---

## For Visitors

### What They See:

**Before Auction:**
- Countdown to next drop
- Clean, minimal interface

**During Auction:**
- Countdown to when it ends
- Grid of all 12 items
- Each item shows:
  - Image (placeholder for now)
  - Current/starting bid
  - Number of bids
  - Reserve met status
- **Inline Bidding:**
  - Quick bid button (next minimum amount)
  - Or enter custom bid amount

**That's it!** Everything happens on one page.

---

## For Admin (You)

### Monthly Workflow:

**Once a Month:**

1. **Login**: Go to `/admin-login`
   - Email: `admin@robbiemoto.com`
   - Password: `admin123`

2. **Create Auction**:
   - Click "New Auction"
   - Enter name: "Spring Collection 2025"
   - Set start date: First Saturday of month, 8pm
   - Set end date: 3 days later
   - Toggle "Published" ON
   - Click "Save Auction"

3. **Add ~12 Items**:
   - From auction edit page, click "Add Item"
   - For each mug:
     - Title: "Sage Green Mug"
     - Description: "Beautiful hand-thrown..."
     - Condition: "New - Handmade"
     - Starting Bid: $35.00
     - Reserve: $80.00 (minimum you'll accept)
   - Click "Add Item to Auction"
   - Repeat 11 more times

4. **Done!**
   - Check homepage to see countdown
   - When auction starts, all items appear

---

## Admin Panel Overview

### Dashboard (`/admin`)
- See total auctions
- See if auction is active
- Total items count
- Recent auctions list

### Manage Auctions (`/admin/auctions`)
- List of all your auctions
- Create new auction
- Edit/delete existing

### Edit Auction (`/admin/auctions/[id]/edit`)
- Update auction details
- **Add items inline** (this is key!)
- See all items in the auction
- Delete items
- Publish/unpublish

---

## Default Settings

These are set automatically and work great:

- **Bid Increment**: $5.00
- **Soft Close Window**: 2 minutes
- **Soft Close Extension**: 2 minutes (prevents sniping)
- **Shipping**: $8.99 flat rate
- **Reserve Pricing**: Hidden from buyers

---

## Quick Tips

### Creating Items:
- Aim for 12 items per auction
- Starting bids around $30-50 work well
- Set reserves at your minimum acceptable price
- Reserve is hidden - buyers don't see it

### Scheduling:
- Monthly auctions work best
- Weekend start times get more traffic
- 3-day auction duration is ideal
- Start Friday evening, end Monday evening

### Pricing Strategy:
- Starting bid: Lower to encourage participation
- Reserve: Your actual minimum
- Example: Start at $35, reserve at $80

---

## What You DON'T Need to Worry About

❌ Database setup (optional, demo mode works fine)  
❌ Complex configuration  
❌ User management  
❌ Payment processing (can add later)  
❌ Email notifications (can add later)  
❌ Image uploads (placeholders work for now)  

---

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

That's it!

---

##  Production Checklist (When Ready)

Want to go live? You'll eventually need:

- [ ] PostgreSQL database (Neon free tier)
- [ ] Clerk authentication (for user accounts)
- [ ] Stripe (for payments)
- [ ] Domain name
- [ ] Deploy to Vercel

But for now, you can run and test everything locally without any of that!

---

## Support

Questions? Check:
- `README.md` - Technical overview
- `SETUP.md` - Full production setup
- `DEVELOPMENT.md` - Code guides

---

**Happy auctioning! 🏺**

