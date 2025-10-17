import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { APP_NAME } from '@/lib/constants'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Handcrafted mugs and leather goods auction platform',
  keywords: ['auction', 'handmade', 'mugs', 'pottery', 'crafts', 'robbiemoto'],
  authors: [{ name: 'Robbiemoto' }],
  creator: 'Robbiemoto',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: 'Handcrafted mugs and leather goods auction platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: 'Handcrafted mugs and leather goods auction platform',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Check if we're running in demo mode (without auth)
const isDemoMode = 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {isDemoMode && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-center text-sm text-yellow-800">
            ⚠️ Running in demo mode without authentication. Some features are disabled.
          </div>
        )}
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}