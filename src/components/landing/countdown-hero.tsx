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
          <div className="space-y-8">
            <p className="text-sm font-light tracking-wide text-gray-600">
              Be the first to know when new pieces drop
            </p>
            
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 border-gray-300 bg-white text-base placeholder:text-gray-400 focus:border-gray-900"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gray-900 px-8 font-medium uppercase tracking-wider text-white hover:bg-gray-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Notify Me'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}


      </div>
    </div>
  )
}