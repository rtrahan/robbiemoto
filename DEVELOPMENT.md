# Development Guide

This guide explains how to develop and extend the Robbiemoto auction platform.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Working Without Services](#working-without-services)
- [Database Development](#database-development)
- [Adding Features](#adding-features)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## Project Structure

```
robbiemugs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (routes)/          # Public routes
│   │   ├── admin/             # Admin panel
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── admin/            # Admin components
│   │   ├── auction/          # Auction components
│   │   ├── lot/              # Lot/item components
│   │   ├── landing/          # Landing page components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities and configs
│   │   ├── prisma.ts         # Database client
│   │   ├── stripe.ts         # Stripe config
│   │   ├── pusher.ts         # Real-time config
│   │   ├── helpers.ts        # Helper functions
│   │   ├── constants.ts      # App constants
│   │   └── inngest/          # Background jobs
│   └── emails/                # Email templates
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── public/                    # Static assets
└── scripts/                   # Utility scripts
```

### Key Files

- `prisma/schema.prisma` - Database schema definition
- `src/lib/prisma.ts` - Prisma client instance
- `src/middleware.ts` - Authentication middleware (Clerk)
- `src/app/api/` - All API endpoints
- `src/lib/inngest/` - Background job definitions

---

## Development Workflow

### 1. Start the Dev Server

```bash
npm run dev
```

The app uses Turbopack for fast hot module replacement (HMR). Changes to files will be reflected instantly.

### 2. View Database

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` - a visual editor for your database.

### 3. Make Changes

Edit files and save. The browser will automatically reload.

**Common dev tasks:**

```bash
# Reset and reseed database
npm run db:push -- --force-reset
npm run db:seed

# Check TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint

# Build for production
npm run build
```

---

## Working Without Services

You can develop most features without external services by using the built-in demo/mock mode.

### Demo Mode Features

When running without API keys, the app automatically uses mock data:

**What works:**
- ✅ All UI components
- ✅ Routing and navigation
- ✅ Admin panel (without auth check)
- ✅ Auction browsing
- ✅ Mock auction data

**What doesn't work:**
- ❌ User authentication
- ❌ Real database queries
- ❌ Payment processing
- ❌ Email sending
- ❌ Real-time updates

### Adding Mock Data Support

When creating new features, add fallback mock data:

```typescript
// Example: API route with mock data
export async function GET() {
  // Check if services are configured
  const isDemoMode = !process.env.DATABASE_URL
  
  if (isDemoMode) {
    // Return mock data
    return NextResponse.json({
      items: getMockItems()
    })
  }
  
  // Real implementation
  const items = await prisma.item.findMany()
  return NextResponse.json({ items })
}

function getMockItems() {
  return [
    { id: '1', name: 'Mock Item 1', ... },
    { id: '2', name: 'Mock Item 2', ... },
  ]
}
```

### Environment Check Helper

Use this pattern to check if services are available:

```typescript
// src/lib/helpers.ts
export function isDemoMode() {
  return !process.env.DATABASE_URL || 
         process.env.DATABASE_URL.includes('placeholder')
}

export function hasClerkAuth() {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
         process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')
}

export function hasStripe() {
  return !!process.env.STRIPE_SECRET_KEY &&
         process.env.STRIPE_SECRET_KEY.startsWith('sk_')
}
```

---

## Database Development

### Schema Changes

1. **Edit schema** in `prisma/schema.prisma`
2. **Push changes**:
   ```bash
   npm run db:push
   ```
3. **Update seed** if needed in `prisma/seed.ts`
4. **Reseed**:
   ```bash
   npm run db:seed
   ```

### Creating Migrations

For production, use migrations:

```bash
# Create migration
npm run db:migrate

# Name it descriptively
# e.g., "add-lot-dimensions-field"
```

### Seeding Strategy

The seed file (`prisma/seed.ts`) creates:
- Demo users (including an admin)
- Multiple auctions in different states
- Lots with realistic data
- Sample bids and activity

**Customize the seed:**
1. Edit `prisma/seed.ts`
2. Run `npm run db:seed`

**Tips:**
- Use realistic data that helps you test
- Create edge cases (empty auctions, sold items, etc.)
- Include time-based scenarios (ending soon, ended, upcoming)

---

## Adding Features

### 1. Create API Route

```typescript
// src/app/api/my-feature/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.myTable.findMany()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### 2. Create Component

```typescript
// src/components/my-feature/my-component.tsx
export function MyComponent() {
  return (
    <div>
      {/* Your component */}
    </div>
  )
}
```

### 3. Create Page

```typescript
// src/app/my-feature/page.tsx
import { MyComponent } from '@/components/my-feature/my-component'

export default function MyFeaturePage() {
  return <MyComponent />
}
```

### 4. Add to Navigation

Edit the appropriate layout or header component to add navigation.

---

## Testing

### Manual Testing

1. **Start dev server**: `npm run dev`
2. **Open Prisma Studio**: `npm run db:studio`
3. **Test in browser**: `http://localhost:3000`

### Test Different Scenarios

**Auctions:**
- Preview state (before start time)
- Live state (between start and end)
- Ended state (after end time)

**Bidding:**
- First bid on an item
- Outbid scenario
- Proxy bidding
- Reserve not met / met

**Admin:**
- Create auction
- Add lots
- Publish/unpublish
- View statistics

### Database Testing

```bash
# Reset to clean state
npm run db:push -- --force-reset
npm run db:seed

# Manually modify data in Prisma Studio
npm run db:studio
```

---

## Best Practices

### Code Style

- Use TypeScript for type safety
- Follow Next.js app router conventions
- Use Tailwind for styling
- Keep components small and focused
- Use server components by default, add 'use client' only when needed

### File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Components: `kebab-case.tsx`
- API routes: `route.ts`

### Component Organization

```typescript
// 1. Imports
import { ... } from '...'

// 2. Types
interface Props {
  ...
}

// 3. Main component
export function MyComponent({ ...props }: Props) {
  // 4. State and hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {}
  
  // 6. Render
  return (
    <div>...</div>
  )
}

// 7. Sub-components or helpers
function Helper() {
  return <div>...</div>
}
```

### Database Queries

- Always use Prisma client from `@/lib/prisma`
- Add error handling
- Use transactions for related operations
- Add indexes for performance

```typescript
// Good
try {
  const result = await prisma.item.findMany({
    where: { published: true },
    include: { auction: true },
    orderBy: { createdAt: 'desc' },
  })
  return result
} catch (error) {
  console.error('Database error:', error)
  throw new Error('Failed to fetch items')
}
```

### Error Handling

```typescript
// API routes
try {
  // ... operation
  return NextResponse.json({ data })
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Descriptive error message' },
    { status: 500 }
  )
}

// Components
try {
  // ... operation
  toast.success('Success!')
} catch (error) {
  toast.error('Something went wrong')
  console.error(error)
}
```

### Performance

- Use Next.js Image component for images
- Implement pagination for long lists
- Use Suspense for loading states
- Cache API responses when appropriate
- Use database indexes for frequent queries

---

## Common Tasks

### Add a New Auction Field

1. Update schema:
```prisma
model Auction {
  // ... existing fields
  myNewField String?
}
```

2. Push to database:
```bash
npm run db:push
```

3. Update forms in admin panel
4. Update display components
5. Update seed data

### Create a New Page

1. Create file in `src/app/my-page/page.tsx`
2. Add to navigation if needed
3. Create components in `src/components/my-page/`
4. Add API routes if needed in `src/app/api/my-page/`

### Debug Issues

**Database errors:**
- Check Prisma Studio for data
- Verify DATABASE_URL is correct
- Check schema matches database

**Auth errors:**
- Verify Clerk keys are correct
- Check middleware.ts configuration
- Clear browser cache

**Build errors:**
- Run `npx tsc --noEmit` to find TypeScript errors
- Check import paths are correct
- Verify all dependencies are installed

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Questions?** Check the SETUP.md guide or create a GitHub issue.

