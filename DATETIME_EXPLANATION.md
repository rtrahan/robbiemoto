# How Auction Date/Time Works

## Simple Explanation:

When you set an auction to end at **"11:20 PM"** on your computer:
- The system saves it as UTC (universal time)
- Users in different timezones see it in THEIR local time
- Everyone sees the SAME moment, just displayed differently

## Example:

**You set (in NYC, EDT timezone):**
- End: October 17, 11:20 PM

**Database stores (UTC):**
- End: October 18, 3:20 AM (because EDT is UTC-4)

**Users see:**
- NYC user: October 17, 11:20 PM
- LA user: October 17, 8:20 PM  
- London user: October 18, 4:20 AM

**All the same moment!**

## How to Use:

1. **Pick the date/time** you want in YOUR timezone
2. **Click Save**
3. **Don't worry about the conversion** - it's automatic!

The countdown on the homepage shows the correct time for each user's location.

