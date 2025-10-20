# Supabase Authentication Setup

## Quick Setup (5 minutes)

### Step 1: Enable Email Auth

1. **Go to** https://supabase.com/dashboard
2. **Select your project** (bdyuqcxtdawxhhdxgkic)
3. **Click "Authentication"** in left sidebar
4. **Click "Providers"** tab
5. **Verify "Email" is enabled** ✅ (should be by default)
6. **Confirm Email Settings:**
   - **For testing**: Turn OFF "Confirm email"
   - **For production**: Keep it ON

### Step 2: Configure Email Templates (Optional)

1. **Click "Email Templates"** in Authentication
2. You can customize:
   - Confirm signup email
   - Reset password email
   - Magic link email

For now, defaults are fine!

### Step 3: No Additional Keys Needed!

Your existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` works for authentication too!

---

## What's Being Built

### User Features:
- ✅ Login/Signup at `/login`
- ✅ Profile page at `/profile`
- ✅ Bid history
- ✅ Email preferences
- ✅ Won items tracking

### Bidding Changes:
- ✅ "Login to bid" requirement
- ✅ Bids linked to real users
- ✅ Bidder names shown
- ✅ Personal bid tracking

### Admin Features:
- ✅ Bid history per auction
- ✅ Winner list with emails
- ✅ Invoice status tracking
- ✅ Export winners (coming)

---

## Testing

Once enabled, test with:

1. **Go to** http://localhost:3000
2. **Click "Login"** in header
3. **Sign up** with your email
4. **Place a bid** on an item
5. **View "Profile"** to see your bids

---

## Email Provider (For Production)

For production, you'll want to configure an email provider:

1. **Supabase Dashboard** → Authentication → **Email Templates**
2. **SMTP Settings** → Add your email service
3. **Or use Supabase's built-in** (limited free tier)

For now, testing works with Supabase's default emails!

---

**Ready to go!** Just enable Email auth and we're set! 🚀


