# Admin Account Setup

## 🔐 Create Admin Account in Supabase

### Step 1: Create Supabase Auth User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@robbiemoto.com`
   - **Password**: `YourSecurePassword` (your choice)
   - **Auto Confirm User**: ✅ **YES** (important!)
4. Click **"Create user"**
5. **Copy the User ID** from the list

### Step 2: Add Admin to Database

Run this SQL in **Supabase** → **SQL Editor**:

```sql
-- Create admin user in database
INSERT INTO "User" ("clerkId", "email", "name", "alias", "role")
VALUES (
  'PASTE_SUPABASE_USER_ID_HERE',  -- Replace with the User ID from Step 1
  'admin@robbiemoto.com',
  'Admin',
  'Admin',
  'ADMIN'
);
```

### Step 3: Login

1. Go to http://localhost:3000/login
2. Enter `admin@robbiemoto.com` and your password
3. You'll be redirected to `/admin` automatically! 🎉

---

## 🏺 Create Regular Bidder Accounts

### For New Users (Sign Up Flow):

1. Go to http://localhost:3000/login
2. Click **"Don't have an account? Sign up"**
3. Fill in:
   - **Your Name**: (e.g., "John Smith") ← Shows in bid history!
   - **Email**: Any email
   - **Password**: At least 6 characters
4. Click **"Create Account"**
5. Done! They can now bid on auctions

### What Happens:
- ✅ User created in Supabase Auth
- ✅ User profile created in database with name
- ✅ Name shows in all bid history
- ✅ No email confirmation required (dev mode)

---

## 📝 Important Notes

- **Name is visible**: The name users enter during signup will be shown to everyone in bid history
- **Admin detection**: System automatically detects `admin@robbiemoto.com` and redirects to admin panel
- **Database sync**: User profiles are automatically created in the database when signing up

