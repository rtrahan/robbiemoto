'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function LiveCountdown({ endsAt }: { endsAt: Date | string }) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining('Ended')
        clearInterval(timer)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endsAt])

  return (
    <div className="flex items-center gap-1.5 md:gap-3">
      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-white flex-shrink-0" />
      <div className="font-mono text-lg md:text-2xl font-bold text-white tracking-tight md:tracking-wide whitespace-nowrap">
        {timeRemaining || '...'}
      </div>
    </div>
  )
}

