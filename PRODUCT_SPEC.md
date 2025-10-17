# Robbiemoto Mug Auction — Product & Build Spec (for Cursor)

*Last updated: 2025-08-16*

## 0) Vision & Context

Create a lightweight, elegant auction site for one‑of‑a‑kind, hand‑carved mugs and leather goods. Replace Instagram "story sales" + manual DMs with a real‑time, fair, and friendly bidding experience that captures emails, scales gently, and keeps the brand's handcrafted vibe.

---

## 1) Goals & Non‑Goals

**Goals**

* Let the maker upload and schedule a limited set of items (mugs) for monthly auctions.
* Public landing page with countdown to next drop; email capture for alerts.
* Account signup/login and frictionless bidding.
* Real‑time bidding with **open ascending format**, proxy bidding, soft‑close extension, and hidden reserve support.
* Seamless post‑auction payment (auto‑charge) + shipping collection.
* Minimal but robust admin to run auctions without engineers.

**Non‑Goals (MVP)**

* Multi‑seller marketplace.
* Complex shipping rules; use flat‑rate only.
* International tax/VAT automation (phase 2).

---

## 2) Auction Mechanics (MVP defaults locked)

* **Mode**: Open Ascending (English) → show current leading bid + bidder alias.
* **Bid Increments**: fixed +$5.
* **Proxy Bidding**: enabled. Bidder sets a max; system auto‑raises to maintain lead.
* **Soft‑Close**: 2 min window / 2 min extension.
* **Reserve Price**: hidden reserve supported; if not met, item doesn't sell.
* **Buy‑Now**: optional, before first bid only.
* **Eligibility**: verified email + saved card required.

### 2.1 Admin Settings Seed

```
auction.visibility = "open"
auction.softClose.windowSec = 120
auction.softClose.extendSec = 120
bidding.proxy.enabled = true
bidding.increment.mode = "fixed"
bidding.increment.fixedCents = 500
reserve.enabled = true
payments.autoChargeOnClose = true
shipping.flatDomesticCents = 899
tax.singleRate.enabled = true
tax.singleRate.percent = 0.0
notifications.email.outbid = true
notifications.sms.outbid = false
media.video.enabled = true
media.video.maxSeconds = 20
media.video.maxMB = 25
```

---

## 3) Roles & Permissions

* **Visitor**: browse, join waitlist, view countdown.
* **Bidder (User)**: register/login, save card/address, bid, pay, view order history, manage notifications.
* **Admin (Maker)**: create/schedule auctions & items, upload media, set increments, preview, start/stop, settle, mark fulfilled, export CSV.

---

## 4) User Flows

### 4.1 Visitor → Waitlist

1. Visit landing; see **Next Drop** countdown.
2. Enter email → confirm via magic link or 6‑digit code.
3. (Optional) Opt‑in to SMS (future).

### 4.2 Auction Preview → Live

1. Preview page shows items (no bidding) + start time.
2. When **Live**, lot pages enable bidding; real‑time updates; outbid toasts/email.

### 4.3 Bid Flow

1. User clicks **Place Bid** → modal shows min allowed bid.
2. If no payment method: collect card via Stripe **SetupIntent**.
3. Place bid atomically; if lead, UI reflects instantly.
4. If outbid, notify in‑app + email with one‑tap **raise bid** CTA.

### 4.4 Close & Settle

1. On close, winning bidder is auto‑charged.
2. If payment fails → retry + notify within 24h.
3. On success → order confirmation + address collection + shipping ETA.

### 4.5 Admin: Create Drop

1. Create **Auction** (name, start/end, increments, soft‑close, reserve, etc).
2. Add **Lots** (title, description, starting bid, reserve, images/video).
3. Preview → Schedule. Dashboard shows health.

---

## 5) Information Architecture (Pages)

* `/` Landing: hero, brand story, next drop countdown, email capture.
* `/auctions` (list): past + upcoming.
* `/auction/[slug]` (event): grid of lots; status (Preview/Live/Ended); timer.
* `/lot/[slug]`: media carousel, details, real‑time bid panel, bid history.
* `/account` → profile, payment methods, addresses, notifications, order history.
* `/admin` → dashboard (KPIs), auctions, lots, bidders, orders, settings.
* Legal: `/terms`, `/privacy`, `/faq`, `/contact`.

---

## 6) Tech Stack

* **Frontend**: Next.js 14+, Tailwind, shadcn/ui.
* **Auth**: Clerk (magic link).
* **DB**: Postgres (Neon) + Prisma.
* **Real‑time**: Pusher.
* **Payments**: Stripe (SetupIntent + off‑session auto‑charge).
* **Email**: Resend (React Email templates).
* **File Upload**: UploadThing → Cloudflare R2/S3.
* **Background Jobs**: Inngest or Vercel CRON.
* **Hosting**: Vercel + Neon.
* **Analytics**: GA4 + PostHog.

---

## 7) Data Model (ERD Summary)

Key entities and fields relevant to MVP decisions:

* **Auction**: status, startsAt, endsAt, softCloseWindowSec=120, softCloseExtendSec=120, incrementMode="fixed", fixedIncrementCents=500, visibility="open".
* **Lot**: startingBidCents, reserveCents?, buyNowCents?, published, media[].
* **Bid**: amountCents, isProxy, maxProxyCents?, status(leading|outbid|retracted|invalid), userId, lotId.
* **Order**: finalPriceCents, shippingCents=899, taxCents, totalCents, paymentIntentId, status.
* **Signup** (waitlist), **Notification** (email only for MVP).

*Primary indexes*: (lotId, createdAt DESC); (auctionId, status); (userId) on bids.

---

## 8) API Surface

**Public**

* GET /api/auctions/:slug → event info, lots, server time.
* GET /api/lots/:slug → lot details, current leading, next min bid.

**Authed (User)**

* POST /api/bids { lotId, amountCents, isProxy?, maxProxyCents? }
* POST /api/watchlist { lotId }
* POST /api/payment/setup-intent → client secret

**Admin**

* POST /api/admin/auctions (CRUD)
* POST /api/admin/lots (CRUD + media upload URLs)
* POST /api/admin/preview/:id/start|stop

**Webhooks**

* POST /api/webhooks/stripe
* POST /api/webhooks/jobs (close/settlement triggers)

---

## 9) Real‑Time & Concurrency

(unchanged; includes proxy bidding + reserve check)

---

## 10) Payments

* Before first bid: save card via Stripe SetupIntent.
* On close: off‑session PaymentIntent for finalPrice + $8.99 shipping + tax.
* Failures: retry up to 24h; then optionally offer runner‑up.
* Taxes (MVP): single hard‑coded rate (Admin → Settings; default 0%).

---

## 11) Notifications

* Email only (MVP): Waitlist confirm, Auction live, Outbid, Win, Payment failed, Receipt, Shipping notice.
* SMS deferred to V2.

---

## 12) Admin Features

* Auctions & Lots CRUD with drag‑sort.
* Media upload (images + short MP4 ≤20s, ≤25MB).
* Hidden reserve field per lot.
* Export CSVs (bidders, orders).
* Settings: increments ($5), soft‑close (2m/2m), shipping ($8.99), tax (single rate).

---

## 13) Brand & UX Notes

* Follow branding cues from [robbiemoto.com](https://www.robbiemoto.com).
* Warm, tactile, handcrafted vibe with generous whitespace.

---

## 14) Security & Compliance

(unchanged)

---

## 15) Analytics & SEO

(unchanged)

---

## 16) Roadmap

**MVP**

* Open ascending auctions with $5 increments.
* Proxy bidding, hidden reserve, soft‑close (2m/2m).
* Stripe auto‑charge on close.
* Flat $8.99 shipping; hard‑coded tax.
* Email notifications only.
* Branding per robbiemoto.com.
* Support for short MP4 mug videos.

**V2**

* SMS outbid alerts, Stripe Tax, international shipping, advanced reporting, buy‑now enhancements, tiered increments, blind mode.

---

## 17) Cursor Build Plan

1. Scaffold: Next.js 14 + Tailwind + shadcn/ui + Prisma + Neon + Clerk + Stripe + Pusher + Resend + UploadThing. Env + health route.
2. Schema: add reserveCents, isProxy/maxProxyCents, soft‑close fields, fixedIncrementCents=500. Migrate.
3. Auth & Account: Clerk magic link; /account for card save (SetupIntent) + addresses.
4. Admin CMS: /admin for auctions/lots; UploadThing→R2; video limits; reserve field.
5. Bidding: server action txn (SELECT … FOR UPDATE); enforce $5; proxy logic; Pusher broadcast.
6. Soft‑Close & Close Job: CRON/worker to extend window; settlement → winner, Order, Stripe charge.
7. Payments & Orders: auto‑charge, $8.99 shipping in totals; single‑rate tax config; receipts via Resend.
8. Landing & Emails: countdown; waitlist capture; React Email templates (email only).
9. Branding & Polish: robbiemoto.com cues; A11y; server time sync; rate limiting; audit logs.

---

## 18) Acceptance Criteria (MVP)

* Admin can create a drop with mugs (images + short MP4), reserve, and schedule.
* User can register, save card, place bids (+$5), receive outbid email, and win.
* Proxy bids auto‑raise; soft‑close 2m/2m extends correctly.
* Winner auto‑charged; order/receipt emails sent; admin sees paid order.
* Flat $8.99 shipping applied; tax applied from config.

---

## 19) Decisions Locked

* Auction format: **Open ascending**
* Proxy bidding: **Enabled**
* Soft‑close: **2m window / 2m extension**
* Bid increments: **+$5 fixed**
* Reserve: **Hidden reserve supported**
* Payment: **Auto‑charge on close**
* Shipping: **$8.99 flat domestic** (no international MVP)
* Tax: **Single hard‑coded rate**
* Notifications: **Email only** (SMS later)
* Branding: **robbiemoto.com style**
* Video: **Short MP4s supported (≤20s, ≤25MB)**

---

