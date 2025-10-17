'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Get the next auction date from the database
async function getNextAuction() {
  try {
    const response = await fetch('/api/next-auction')
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch next auction:', error)
  }
  return null
}

export function CountdownHero() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [nextAuction, setNextAuction] = useState<{ name: string; date: Date } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Fetch next auction
    getNextAuction().then(auction => {
      if (auction) {
        setNextAuction({
          name: auction.name,
          date: new Date(auction.startsAt)
        })
      } else {
        // Default to 7 days from now if no auction found
        setNextAuction({
          name: 'Next Drop',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!nextAuction) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(nextAuction.date).getTime()
      const difference = target - now

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [nextAuction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to join waitlist')
      }
      
      setIsSubscribed(true)
      toast.success('You\'re in! We\'ll notify you before the next drop.')
      setEmail('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-white" />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4">
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />
      
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Craft label */}
        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500">
            Handcrafted in Chattanooga, TN
          </p>
        </div>

        {/* Main title */}
        <h1 className="mb-16 font-serif text-7xl font-light tracking-tight text-gray-900 sm:text-8xl md:text-9xl">
          NEXT DROP
        </h1>
        
        {/* Countdown with colons */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
            <div className="flex flex-col">
              <span className="font-mono text-6xl font-light tabular-nums text-gray-900 sm:text-7xl md:text-8xl">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="mt-4 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
                Days
              </span>
            </div>
            
            <span className="text-5xl font-thin text-gray-300 sm:text-6xl md:text-7xl">:</span>
            
            <div className="flex flex-col">
              <span className="font-mono text-6xl font-light tabular-nums text-gray-900 sm:text-7xl md:text-8xl">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="mt-4 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
                Hours
              </span>
            </div>
            
            <span className="text-5xl font-thin text-gray-300 sm:text-6xl md:text-7xl">:</span>
            
            <div className="flex flex-col">
              <span className="font-mono text-6xl font-light tabular-nums text-gray-900 sm:text-7xl md:text-8xl">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="mt-4 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
                Minutes
              </span>
            </div>
            
            <span className="text-5xl font-thin text-gray-300 sm:text-6xl md:text-7xl">:</span>
            
            <div className="flex flex-col">
              <span className="font-mono text-6xl font-light tabular-nums text-gray-900 sm:text-7xl md:text-8xl">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="mt-4 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
                Seconds
              </span>
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="mx-auto mb-12 h-px w-20 bg-gray-300" />
        
        {/* Email signup */}
        {isSubscribed ? (
          <div className="mx-auto max-w-md">
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-8">
              <p className="text-sm font-medium uppercase tracking-wider text-gray-900">You're on the list</p>
              <p className="mt-2 text-xs text-gray-600">
                We'll notify you when the next collection drops.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-light tracking-wide text-gray-600">
              Follow along for updates and new drops
            </p>
            
            <a 
              href="https://instagram.com/robbiemoto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium uppercase tracking-wider hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @robbiemoto
            </a>
          </div>
        )}


      </div>
    </div>
  )
}